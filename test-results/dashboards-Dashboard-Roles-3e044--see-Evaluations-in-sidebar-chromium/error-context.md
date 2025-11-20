# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "Registrarse" [level=2] [ref=e4]
  - generic [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]: Nombre Completo
      - textbox "Nombre Completo" [ref=e8]:
        - /placeholder: Juan Pérez
        - text: Estudiante Test
    - generic [ref=e9]:
      - generic [ref=e10]: Correo Electrónico
      - textbox "Correo Electrónico" [ref=e11]:
        - /placeholder: tu@email.com
        - text: student@test.com
    - generic [ref=e12]:
      - generic [ref=e13]: Rol
      - combobox "Rol" [ref=e14]:
        - option "Desarrollador" [selected]
        - option "Scrum Master"
        - option "Product Owner"
        - option "Administrador"
    - generic [ref=e15]:
      - generic [ref=e16]: Contraseña
      - textbox "Contraseña" [ref=e17]:
        - /placeholder: ••••••••
        - text: student123
    - generic [ref=e18]:
      - generic [ref=e19]: Confirmar Contraseña
      - textbox "Confirmar Contraseña" [ref=e20]:
        - /placeholder: ••••••••
      - paragraph [ref=e21]: Las contraseñas no coinciden
    - button "Registrarse" [active] [ref=e22]
  - paragraph [ref=e23]:
    - text: ¿Ya tienes cuenta?
    - link "Inicia sesión aquí" [ref=e24] [cursor=pointer]:
      - /url: /login
```