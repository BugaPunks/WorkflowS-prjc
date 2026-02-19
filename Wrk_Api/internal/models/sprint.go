package models

import (
	"time"
)

type Sprint struct {
	ID          string     `gorm:"primaryKey;type:string"`
	ProjectID   string     `gorm:"not null"`
	Name        string     `gorm:"not null"`
	Description *string
	StartDate   time.Time  `gorm:"not null"`
	EndDate     time.Time  `gorm:"not null"`
	Status      string     `gorm:"default:'PLANNING'"`
	CreatedAt   time.Time  `gorm:"autoCreateTime"`
	UpdatedAt   time.Time  `gorm:"autoUpdateTime"`

	// Relationships
	Project            Project             `gorm:"foreignKey:ProjectID;constraint:OnDelete:CASCADE"`
	UserStories        []UserStory         `gorm:"foreignKey:SprintID"`
	Tasks              []Task              `gorm:"foreignKey:SprintID"`
	RetrospectiveItems []RetrospectiveItem `gorm:"foreignKey:SprintID"`
	Evaluations        []Evaluation        `gorm:"foreignKey:SprintID"`
}

func (Sprint) TableName() string {
	return "sprints"
}

type RetrospectiveItem struct {
	ID        string    `gorm:"primaryKey;type:string"`
	SprintID  string    `gorm:"not null"`
	Type      string    `gorm:"not null"` // GOOD, BAD, ACTION
	Content   string    `gorm:"not null"`
	UserID    string    `gorm:"not null"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP"`

	Sprint Sprint `gorm:"foreignKey:SprintID;constraint:OnDelete:CASCADE"`
	User   User   `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

func (RetrospectiveItem) TableName() string {
	return "retrospective_items"
}
