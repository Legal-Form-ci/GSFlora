export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          author_id: string
          content: string
          created_at: string
          expires_at: string | null
          id: string
          is_urgent: boolean | null
          published_at: string | null
          school_id: string | null
          target_class_id: string | null
          target_type: string | null
          title: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_urgent?: boolean | null
          published_at?: string | null
          school_id?: string | null
          target_class_id?: string | null
          target_type?: string | null
          title: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_urgent?: boolean | null
          published_at?: string | null
          school_id?: string | null
          target_class_id?: string | null
          target_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_target_class_id_fkey"
            columns: ["target_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          content: string | null
          created_at: string
          feedback: string | null
          file_url: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          school_id: string | null
          score: number | null
          status: string | null
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          assignment_id: string
          content?: string | null
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          school_id?: string | null
          score?: number | null
          status?: string | null
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          assignment_id?: string
          content?: string | null
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          school_id?: string | null
          score?: number | null
          status?: string | null
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          allow_late_submission: boolean | null
          assignment_type: string | null
          coefficient: number | null
          course_id: string
          created_at: string
          description: string | null
          due_date: string
          id: string
          is_published: boolean | null
          max_score: number | null
          school_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          allow_late_submission?: boolean | null
          assignment_type?: string | null
          coefficient?: number | null
          course_id: string
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          is_published?: boolean | null
          max_score?: number | null
          school_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          allow_late_submission?: boolean | null
          assignment_type?: string | null
          coefficient?: number | null
          course_id?: string
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          is_published?: boolean | null
          max_score?: number | null
          school_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          arrival_time: string | null
          class_id: string
          course_id: string | null
          created_at: string
          date: string
          id: string
          notes: string | null
          recorded_by: string | null
          school_id: string | null
          status: string
          student_id: string
        }
        Insert: {
          arrival_time?: string | null
          class_id: string
          course_id?: string | null
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          recorded_by?: string | null
          school_id?: string | null
          status: string
          student_id: string
        }
        Update: {
          arrival_time?: string | null
          class_id?: string
          course_id?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          recorded_by?: string | null
          school_id?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          created_by: string | null
          cycle: string
          id: string
          level: string
          name: string
          school_id: string | null
          updated_at: string
          year: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          cycle: string
          id?: string
          level: string
          name: string
          school_id?: string | null
          updated_at?: string
          year: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          cycle?: string
          id?: string
          level?: string
          name?: string
          school_id?: string | null
          updated_at?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          school_id: string | null
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          school_id?: string | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          school_id?: string | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          chapter: string | null
          class_id: string
          content: string | null
          created_at: string
          difficulty: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          published_at: string | null
          school_id: string | null
          subject_id: string
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          chapter?: string | null
          class_id: string
          content?: string | null
          created_at?: string
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          school_id?: string | null
          subject_id: string
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          chapter?: string | null
          class_id?: string
          content?: string | null
          created_at?: string
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          school_id?: string | null
          subject_id?: string
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_schedules: {
        Row: {
          config_id: string | null
          created_at: string | null
          id: string
          published_at: string | null
          published_by: string | null
          schedule_data: Json
          school_id: string | null
          school_year: string
          status: string | null
        }
        Insert: {
          config_id?: string | null
          created_at?: string | null
          id?: string
          published_at?: string | null
          published_by?: string | null
          schedule_data: Json
          school_id?: string | null
          school_year: string
          status?: string | null
        }
        Update: {
          config_id?: string | null
          created_at?: string | null
          id?: string
          published_at?: string | null
          published_by?: string | null
          schedule_data?: Json
          school_id?: string | null
          school_year?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_schedules_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "schedule_generation_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_schedules_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          assignment_id: string | null
          coefficient: number | null
          comments: string | null
          course_id: string
          created_at: string
          grade_type: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          max_score: number | null
          quiz_id: string | null
          school_id: string | null
          school_year: string | null
          score: number
          student_id: string
          trimester: number | null
        }
        Insert: {
          assignment_id?: string | null
          coefficient?: number | null
          comments?: string | null
          course_id: string
          created_at?: string
          grade_type?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          max_score?: number | null
          quiz_id?: string | null
          school_id?: string | null
          school_year?: string | null
          score: number
          student_id: string
          trimester?: number | null
        }
        Update: {
          assignment_id?: string | null
          coefficient?: number | null
          comments?: string | null
          course_id?: string
          created_at?: string
          grade_type?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          max_score?: number | null
          quiz_id?: string | null
          school_id?: string | null
          school_year?: string | null
          score?: number
          student_id?: string
          trimester?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_read: boolean | null
          reference_id: string | null
          reference_type: string | null
          school_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          school_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          school_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          attempt_number: number | null
          completed_at: string | null
          created_at: string
          id: string
          quiz_id: string
          school_id: string | null
          score: number | null
          started_at: string | null
          student_id: string
          time_spent_seconds: number | null
        }
        Insert: {
          answers?: Json | null
          attempt_number?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          quiz_id: string
          school_id?: string | null
          score?: number | null
          started_at?: string | null
          student_id: string
          time_spent_seconds?: number | null
        }
        Update: {
          answers?: Json | null
          attempt_number?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          quiz_id?: string
          school_id?: string | null
          score?: number | null
          started_at?: string | null
          student_id?: string
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string | null
          created_at: string
          explanation: string | null
          id: string
          options: Json | null
          order_index: number | null
          points: number | null
          question_text: string
          question_type: string
          quiz_id: string
          school_id: string | null
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index?: number | null
          points?: number | null
          question_text: string
          question_type: string
          quiz_id: string
          school_id?: string | null
        }
        Update: {
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index?: number | null
          points?: number | null
          question_text?: string
          question_type?: string
          quiz_id?: string
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          closes_at: string | null
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          max_attempts: number | null
          max_score: number | null
          opens_at: string | null
          passing_score: number | null
          randomize_questions: boolean | null
          school_id: string | null
          show_answers_after: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          closes_at?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          max_attempts?: number | null
          max_score?: number | null
          opens_at?: string | null
          passing_score?: number | null
          randomize_questions?: boolean | null
          school_id?: string | null
          show_answers_after?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          closes_at?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          max_attempts?: number | null
          max_score?: number | null
          opens_at?: string | null
          passing_score?: number | null
          randomize_questions?: boolean | null
          school_id?: string | null
          show_answers_after?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_generation_config: {
        Row: {
          break_duration_minutes: number
          course_duration_minutes: number
          created_at: string | null
          end_time_wednesday: string
          end_time_weekdays: string
          generated_at: string | null
          generated_by: string | null
          id: string
          is_active: boolean | null
          lunch_end: string
          lunch_start: string
          school_id: string | null
          school_year: string
          start_time_wednesday: string
          start_time_weekdays: string
          total_rooms: number
          updated_at: string | null
        }
        Insert: {
          break_duration_minutes?: number
          course_duration_minutes?: number
          created_at?: string | null
          end_time_wednesday?: string
          end_time_weekdays?: string
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          is_active?: boolean | null
          lunch_end?: string
          lunch_start?: string
          school_id?: string | null
          school_year: string
          start_time_wednesday?: string
          start_time_weekdays?: string
          total_rooms?: number
          updated_at?: string | null
        }
        Update: {
          break_duration_minutes?: number
          course_duration_minutes?: number
          created_at?: string | null
          end_time_wednesday?: string
          end_time_weekdays?: string
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          is_active?: boolean | null
          lunch_end?: string
          lunch_start?: string
          school_id?: string | null
          school_year?: string
          start_time_wednesday?: string
          start_time_weekdays?: string
          total_rooms?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_generation_config_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          class_id: string
          course_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          room: string | null
          school_id: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          class_id: string
          course_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          room?: string | null
          school_id?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          course_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          room?: string | null
          school_id?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_expenses: {
        Row: {
          amount: number
          approved_by: string | null
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
          receipt_url: string | null
          recorded_by: string | null
          school_id: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          category: string
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          receipt_url?: string | null
          recorded_by?: string | null
          school_id?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          receipt_url?: string | null
          recorded_by?: string | null
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_expenses_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_expenses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_members: {
        Row: {
          id: string
          is_active: boolean | null
          joined_at: string | null
          role: string
          school_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          role?: string
          school_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          role?: string
          school_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_members_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          created_at: string | null
          created_by: string | null
          custom_domain: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          max_students: number | null
          max_teachers: number | null
          name: string
          phone: string | null
          slug: string
          subscription_plan: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_domain?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          max_students?: number | null
          max_teachers?: number | null
          name: string
          phone?: string | null
          slug: string
          subscription_plan?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_domain?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          max_students?: number | null
          max_teachers?: number | null
          name?: string
          phone?: string | null
          slug?: string
          subscription_plan?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      student_classes: {
        Row: {
          class_id: string
          created_at: string
          id: string
          school_id: string | null
          school_year: string
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          school_id?: string | null
          school_year: string
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          school_id?: string | null
          school_year?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_parent_relationships: {
        Row: {
          created_at: string
          id: string
          parent_id: string
          relationship: string | null
          school_id: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id: string
          relationship?: string | null
          school_id?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string
          relationship?: string | null
          school_id?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_parent_relationships_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_parent_relationships_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_parent_relationships_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          receipt_number: string | null
          recorded_by: string | null
          school_id: string | null
          student_id: string
          tuition_fee_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          receipt_number?: string | null
          recorded_by?: string | null
          school_id?: string | null
          student_id: string
          tuition_fee_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          receipt_number?: string | null
          recorded_by?: string | null
          school_id?: string | null
          student_id?: string
          tuition_fee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_payments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_payments_tuition_fee_id_fkey"
            columns: ["tuition_fee_id"]
            isOneToOne: false
            referencedRelation: "tuition_fees"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string | null
          coefficient: number | null
          created_at: string
          id: string
          name: string
          school_id: string | null
        }
        Insert: {
          code?: string | null
          coefficient?: number | null
          created_at?: string
          id?: string
          name: string
          school_id?: string | null
        }
        Update: {
          code?: string | null
          coefficient?: number | null
          created_at?: string
          id?: string
          name?: string
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_subjects: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          school_id: string | null
          subject_id: string
          teacher_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          school_id?: string | null
          subject_id: string
          teacher_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          school_id?: string | null
          subject_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      tuition_fees: {
        Row: {
          class_id: string | null
          created_at: string
          description: string | null
          id: string
          other_fees: number
          registration_fee: number
          school_id: string | null
          school_year: string
          total_amount: number | null
          tuition_fee: number
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          other_fees?: number
          registration_fee?: number
          school_id?: string | null
          school_year: string
          total_amount?: number | null
          tuition_fee?: number
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          other_fees?: number
          registration_fee?: number
          school_id?: string | null
          school_year?: string
          total_amount?: number | null
          tuition_fee?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tuition_fees_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_fees_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          language: string | null
          must_change_password: boolean | null
          notifications_enabled: boolean | null
          password_changed_at: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language?: string | null
          must_change_password?: boolean | null
          notifications_enabled?: boolean | null
          password_changed_at?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string | null
          must_change_password?: boolean | null
          notifications_enabled?: boolean | null
          password_changed_at?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_super_admin_role: {
        Args: { user_email: string }
        Returns: undefined
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_school_id: { Args: { _user_id: string }; Returns: string }
      has_educator_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_parent_of_student: {
        Args: { _parent_id: string; _student_id: string }
        Returns: boolean
      }
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean }
      is_school_admin: {
        Args: { _school_id: string; _user_id: string }
        Returns: boolean
      }
      is_school_member: {
        Args: { _school_id: string; _user_id: string }
        Returns: boolean
      }
      is_student_in_class: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
      is_teacher_of_course: {
        Args: { _course_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "teacher"
        | "student"
        | "parent"
        | "educator"
        | "censor"
        | "founder"
        | "principal_teacher"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin",
        "teacher",
        "student",
        "parent",
        "educator",
        "censor",
        "founder",
        "principal_teacher",
      ],
    },
  },
} as const
