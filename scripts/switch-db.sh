#!/bin/bash

# Script para alternar entre SQLite y PostgreSQL
# Uso: ./switch-db.sh

set -e

# URLs de base de datos
SQLITE_URL="file:./prisma/dev.db"
POSTGRES_URL="postgresql://postgres:123456@localhost:5432/workflow_db"

# Archivo de esquema
SCHEMA_FILE="prisma/schema.prisma"
ENV_FILE=".env"

# Función para obtener el provider actual
get_current_provider() {
    grep -A 5 "datasource db" "$SCHEMA_FILE" | grep -oP 'provider = "\K[^"]+'
}

# Función para cambiar provider
switch_provider() {
    local current_provider="$1"
    local new_provider="$2"
    sed -i '/datasource db/,/}/ s/provider = "'"$current_provider"'"/provider = "'"$new_provider"'"/' "$SCHEMA_FILE"
    if [ "$new_provider" = "sqlite" ]; then
        # Agregar engineType = "binary" si no existe
        if ! grep -q 'engineType = "binary"' "$SCHEMA_FILE"; then
            sed -i '/provider = "prisma-client-js"/a\  engineType = "binary"' "$SCHEMA_FILE"
        fi
    elif [ "$new_provider" = "postgresql" ]; then
        # Remover engineType = "binary" si existe
        sed -i '/engineType = "binary"/d' "$SCHEMA_FILE"
    fi
}

# Función para cambiar DATABASE_URL
switch_db_url() {
    local new_url="$1"
    if grep -q "DATABASE_URL" "$ENV_FILE"; then
        sed -i "s|DATABASE_URL=\".*\"|DATABASE_URL=\"$new_url\"|" "$ENV_FILE"
    else
        echo "DATABASE_URL=\"$new_url\"" >> "$ENV_FILE"
    fi
}

# Función para ejecutar migraciones
run_migrations() {
    echo "Eliminando migraciones anteriores..."
    rm -rf prisma/migrations
    rm -f prisma/migration_lock.toml
    echo "Reseteando base de datos..."
    npx prisma migrate reset --force
    echo "Generando cliente Prisma..."
    npx prisma generate
}

# Main
current_provider=$(get_current_provider)

echo "Provider actual: $current_provider"

if [ "$current_provider" = "sqlite" ]; then
    echo "Cambiando a PostgreSQL..."
    switch_provider "sqlite" "postgresql"
    switch_db_url "$POSTGRES_URL"
    echo "Asegúrate de que PostgreSQL esté corriendo."
    echo "Si hay datos en SQLite, expórtalos antes de migrar."
elif [ "$current_provider" = "postgresql" ]; then
    echo "Cambiando a SQLite..."
    switch_provider "postgresql" "sqlite"
    switch_db_url "$SQLITE_URL"
    echo "Si hay datos en PostgreSQL, expórtalos antes de migrar."
else
    echo "Error: Provider desconocido: $current_provider"
    exit 1
fi

echo "Cambio completado. Ejecutando migraciones..."
run_migrations

echo "Switch completado. Reinicia el servidor si es necesario."