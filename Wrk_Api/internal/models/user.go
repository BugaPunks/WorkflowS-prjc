package models

import (
	"time"
)

type User struct {
	ID        string    `gorm:"primaryKey;type:string"` // CUIDs are strings
	Email     string    `gorm:"uniqueIndex;not null"`
	Name      string    `gorm:"not null"`
	Password  string    `gorm:"not null"`
	Role      string    `gorm:"default:'TEAM_DEVELOPER'"`
	Avatar    *string
	Active    bool      `gorm:"default:true"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`

	// Relationships
	Projects           []Project           `gorm:"foreignKey:OwnerID"`
	Tasks              []Task              `gorm:"foreignKey:AssigneeID"`
	Evaluations        []Evaluation        `gorm:"foreignKey:EvaluatorID"`
	UserStories        []UserStory         `gorm:"foreignKey:AssigneeID"`
	Messages           []Message           `gorm:"foreignKey:UserID"`
	ChatParticipants   []ChatParticipant   `gorm:"foreignKey:UserID"`
	ProjectMemberships []ProjectMember     `gorm:"foreignKey:UserID"`
	Notifications      []Notification      `gorm:"foreignKey:UserID"`
	RetrospectiveItems []RetrospectiveItem `gorm:"foreignKey:UserID"`
}

func (User) TableName() string {
	return "users"
}
