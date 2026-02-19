package models

import (
	"time"
)

type Rubric struct {
	ID          string     `gorm:"primaryKey;type:string"`
	ProjectID   *string
	Name        string     `gorm:"not null"`
	Description *string
	CreatedAt   time.Time  `gorm:"autoCreateTime"`
	UpdatedAt   time.Time  `gorm:"autoUpdateTime"`

	// Relationships
	Project     *Project   `gorm:"foreignKey:ProjectID;constraint:OnDelete:CASCADE"`
	Criteria    []Criteria `gorm:"foreignKey:RubricID"`
}

func (Rubric) TableName() string {
	return "rubrics"
}

type Criteria struct {
	ID          string     `gorm:"primaryKey;type:string"`
	RubricID    string     `gorm:"not null"`
	Name        string     `gorm:"not null"`
	Description *string
	MaxScore    int        `gorm:"default:100"`
	Weight      int        `gorm:"default:1"`

	Rubric      Rubric     `gorm:"foreignKey:RubricID;constraint:OnDelete:CASCADE"`
}

func (Criteria) TableName() string {
	return "criteria"
}

type Evaluation struct {
	ID          string     `gorm:"primaryKey;type:string"`
	ProjectID   string     `gorm:"not null"`
	TaskID      *string
	SprintID    *string
	EvaluatorID string     `gorm:"not null"`
	Status      string     `gorm:"default:'PENDING'"`
	Feedback    *string
	Score       *int
	CreatedAt   time.Time  `gorm:"autoCreateTime"`
	UpdatedAt   time.Time  `gorm:"autoUpdateTime"`

	// Relationships
	Project     Project     `gorm:"foreignKey:ProjectID;constraint:OnDelete:CASCADE"`
	Task        *Task       `gorm:"foreignKey:TaskID;constraint:OnDelete:CASCADE"`
	Sprint      *Sprint     `gorm:"foreignKey:SprintID;constraint:OnDelete:CASCADE"`
	Evaluator   User        `gorm:"foreignKey:EvaluatorID"`
	Criteria    []EvaluationCriteria `gorm:"foreignKey:EvaluationID"`
}

func (Evaluation) TableName() string {
	return "evaluations"
}

type EvaluationCriteria struct {
	ID           string     `gorm:"primaryKey;type:string"`
	EvaluationID string     `gorm:"not null;uniqueIndex:idx_eval_crit"`
	CriteriaID   string     `gorm:"not null;uniqueIndex:idx_eval_crit"`
	Score        int        `gorm:"default:0"`
	Comment      *string

	Evaluation   Evaluation `gorm:"foreignKey:EvaluationID;constraint:OnDelete:CASCADE"`
	Criteria     Criteria   `gorm:"foreignKey:CriteriaID"`
}

func (EvaluationCriteria) TableName() string {
	return "evaluation_criteria"
}
