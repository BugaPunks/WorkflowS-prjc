package models

import (
	"time"
)

type UserStory struct {
	ID          string     `gorm:"primaryKey;type:string"`
	ProjectID   string     `gorm:"not null"`
	Title       string     `gorm:"not null"`
	Description string     `gorm:"not null"`
	Acceptance  *string
	Priority    string     `gorm:"default:'MEDIUM'"`
	StoryPoints *int
	Status      string     `gorm:"default:'BACKLOG'"`
	CompletedAt *time.Time
	CreatedAt   time.Time  `gorm:"autoCreateTime"`
	UpdatedAt   time.Time  `gorm:"autoUpdateTime"`

	// Relationships
	AssigneeID  *string
	Assignee    *User      `gorm:"foreignKey:AssigneeID"`
	SprintID    *string
	Sprint      *Sprint    `gorm:"foreignKey:SprintID"`
	Project     Project    `gorm:"foreignKey:ProjectID;constraint:OnDelete:CASCADE"`
	Tasks       []Task     `gorm:"foreignKey:UserStoryID"`
}

func (UserStory) TableName() string {
	return "user_stories"
}

type Task struct {
	ID          string     `gorm:"primaryKey;type:string"`
	ProjectID   string     `gorm:"not null"`
	UserStoryID *string
	SprintID    *string
	Title       string     `gorm:"not null"`
	Description *string
	Priority    string     `gorm:"default:'MEDIUM'"`
	Status      string     `gorm:"default:'TODO'"`
	Deadline    *time.Time
	CompletedAt *time.Time
	CreatedAt   time.Time  `gorm:"autoCreateTime"`
	UpdatedAt   time.Time  `gorm:"autoUpdateTime"`

	// Relationships
	AssigneeID  *string
	Assignee    *User      `gorm:"foreignKey:AssigneeID"`
	Project     Project    `gorm:"foreignKey:ProjectID;constraint:OnDelete:CASCADE"`
	UserStory   *UserStory `gorm:"foreignKey:UserStoryID"`
	Sprint      *Sprint    `gorm:"foreignKey:SprintID"`
	Evaluations []Evaluation `gorm:"foreignKey:TaskID"`
}

func (Task) TableName() string {
	return "tasks"
}
