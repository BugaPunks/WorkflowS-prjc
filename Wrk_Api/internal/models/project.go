package models

import (
	"time"
)

type Project struct {
	ID          string     `gorm:"primaryKey;type:string"`
	Name        string     `gorm:"not null"`
	Description *string
	Status      string     `gorm:"default:'ACTIVE'"`
	StartDate   *time.Time
	EndDate     *time.Time
	CreatedAt   time.Time  `gorm:"autoCreateTime"`
	UpdatedAt   time.Time  `gorm:"autoUpdateTime"`

	// Relationships
	OwnerID     string
	Owner       User            `gorm:"foreignKey:OwnerID;constraint:OnDelete:CASCADE"`
	Members     []ProjectMember `gorm:"foreignKey:ProjectID"`
	Sprints     []Sprint        `gorm:"foreignKey:ProjectID"`
	UserStories []UserStory     `gorm:"foreignKey:ProjectID"`
	Tasks       []Task          `gorm:"foreignKey:ProjectID"`
	Evaluations []Evaluation    `gorm:"foreignKey:ProjectID"`
	Rubrics     []Rubric        `gorm:"foreignKey:ProjectID"`
	Chats       []Chat          `gorm:"foreignKey:ProjectID"`
	Documents   []Document      `gorm:"foreignKey:ProjectID"`
}

func (Project) TableName() string {
	return "projects"
}

type ProjectMember struct {
	ID        string    `gorm:"primaryKey;type:string"`
	ProjectID string    `gorm:"not null;uniqueIndex:idx_project_member"`
	UserID    string    `gorm:"not null;uniqueIndex:idx_project_member"`
	Role      string    `gorm:"not null"`
	JoinedAt  time.Time `gorm:"default:CURRENT_TIMESTAMP"`

	Project Project `gorm:"foreignKey:ProjectID;constraint:OnDelete:CASCADE"`
	User    User    `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

func (ProjectMember) TableName() string {
	return "project_members"
}

type Document struct {
	ID        string    `gorm:"primaryKey;type:string"`
	ProjectID string    `gorm:"not null"`
	Name      string    `gorm:"not null"`
	URL       string    `gorm:"not null"` // Simulated
	Type      string    `gorm:"not null"` // PDF, DOCX, etc.
	Size      *int      // KB
	Version   int       `gorm:"default:1"`
	ParentID  *string
	UploadedAt time.Time `gorm:"default:CURRENT_TIMESTAMP"`

	Project   Project   `gorm:"foreignKey:ProjectID;constraint:OnDelete:CASCADE"`
	Parent    *Document `gorm:"foreignKey:ParentID;constraint:OnDelete:SET NULL"`
	Versions  []Document `gorm:"foreignKey:ParentID"`
}

func (Document) TableName() string {
	return "documents"
}
