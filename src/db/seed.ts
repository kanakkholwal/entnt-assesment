import {
  jobsService,
  candidatesService,
  assessmentsService,
  DatabaseUtils
} from './services'
import type {
  CreateJobRequest,
  CreateCandidateRequest,
  CreateAssessmentRequest,
  CandidateStage,
  QuestionType
} from '../types'

// Sample data for seeding
const SAMPLE_JOBS: CreateJobRequest[] = [
  {
    title: 'Senior Frontend Developer',
    description: 'We are looking for an experienced frontend developer to join our team and help build amazing user experiences.',
    requirements: [
      '5+ years of React experience',
      'Strong TypeScript skills',
      'Experience with modern build tools',
      'Knowledge of testing frameworks'
    ],
    tags: ['React', 'TypeScript', 'Frontend', 'Senior']
  },
  {
    title: 'Backend Engineer',
    description: 'Join our backend team to build scalable and reliable services that power our platform.',
    requirements: [
      '3+ years of Node.js experience',
      'Database design experience',
      'API development skills',
      'Cloud platform knowledge'
    ],
    tags: ['Node.js', 'Backend', 'API', 'Cloud']
  },
  {
    title: 'Full Stack Developer',
    description: 'Looking for a versatile developer who can work across the entire stack.',
    requirements: [
      'Experience with both frontend and backend',
      'React and Node.js knowledge',
      'Database experience',
      'DevOps familiarity'
    ],
    tags: ['Full Stack', 'React', 'Node.js', 'DevOps']
  },
  {
    title: 'DevOps Engineer',
    description: 'Help us build and maintain our infrastructure and deployment pipelines.',
    requirements: [
      'AWS/Azure experience',
      'Docker and Kubernetes',
      'CI/CD pipeline setup',
      'Infrastructure as Code'
    ],
    tags: ['DevOps', 'AWS', 'Docker', 'Kubernetes']
  },
  {
    title: 'Product Manager',
    description: 'Lead product strategy and work closely with engineering and design teams.',
    requirements: [
      '3+ years of product management',
      'Technical background preferred',
      'Strong communication skills',
      'Data-driven decision making'
    ],
    tags: ['Product', 'Strategy', 'Leadership']
  },
  {
    title: 'UX Designer',
    description: 'Create intuitive and beautiful user experiences for our products.',
    requirements: [
      'Portfolio of UX/UI work',
      'Figma proficiency',
      'User research experience',
      'Design system knowledge'
    ],
    tags: ['UX', 'Design', 'Figma', 'Research']
  },
  {
    title: 'Data Scientist',
    description: 'Analyze data to drive business insights and build predictive models.',
    requirements: [
      'Python and R experience',
      'Machine learning knowledge',
      'Statistical analysis skills',
      'SQL proficiency'
    ],
    tags: ['Data Science', 'Python', 'ML', 'Analytics']
  },
  {
    title: 'Mobile Developer',
    description: 'Build native mobile applications for iOS and Android platforms.',
    requirements: [
      'React Native or Flutter',
      'Native development experience',
      'App store deployment',
      'Mobile UI/UX understanding'
    ],
    tags: ['Mobile', 'React Native', 'iOS', 'Android']
  },
  {
    title: 'QA Engineer',
    description: 'Ensure quality through comprehensive testing strategies and automation.',
    requirements: [
      'Test automation experience',
      'Manual testing skills',
      'Bug tracking and reporting',
      'Performance testing knowledge'
    ],
    tags: ['QA', 'Testing', 'Automation', 'Quality']
  },
  {
    title: 'Security Engineer',
    description: 'Protect our systems and data through security best practices and monitoring.',
    requirements: [
      'Security frameworks knowledge',
      'Penetration testing experience',
      'Compliance understanding',
      'Incident response skills'
    ],
    tags: ['Security', 'Compliance', 'Monitoring']
  }
]

// Generate random candidate names
const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'River',
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William',
  'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander',
  'Abigail', 'Michael', 'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Sofia', 'Jackson', 'Avery', 'Sebastian'
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
]

const CANDIDATE_STAGES: CandidateStage[] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected']

// Utility functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generateRandomName(): string {
  const firstName = getRandomElement(FIRST_NAMES)
  const lastName = getRandomElement(LAST_NAMES)
  return `${firstName} ${lastName}`
}

function generateRandomEmail(name: string): string {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.')
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'company.com']
  const domain = getRandomElement(domains)
  return `${cleanName}@${domain}`
}

// Sample assessment questions by job type
const ASSESSMENT_TEMPLATES = {
  'Senior Frontend Developer': {
    title: 'Frontend Development Assessment',
    sections: [
      {
        title: 'Technical Experience',
        questions: [
          {
            type: 'single-choice' as QuestionType,
            title: 'How many years of React experience do you have?',
            required: true,
            options: ['Less than 1 year', '1-2 years', '3-4 years', '5+ years']
          },
          {
            type: 'multi-choice' as QuestionType,
            title: 'Which of the following technologies have you worked with?',
            required: true,
            options: ['TypeScript', 'Next.js', 'Redux', 'GraphQL', 'Jest', 'Cypress']
          },
          {
            type: 'long-text' as QuestionType,
            title: 'Describe a challenging frontend problem you solved recently.',
            required: true,
            validation: { minLength: 100, maxLength: 1000 }
          }
        ]
      },
      {
        title: 'Code Review',
        questions: [
          {
            type: 'long-text' as QuestionType,
            title: 'Review this React component and suggest improvements:\n\n```jsx\nfunction UserList({ users }) {\n  return (\n    <div>\n      {users.map(user => (\n        <div key={user.id}>\n          <h3>{user.name}</h3>\n          <p>{user.email}</p>\n        </div>\n      ))}\n    </div>\n  )\n}\n```',
            required: true,
            validation: { minLength: 50, maxLength: 500 }
          }
        ]
      }
    ]
  },
  'Backend Engineer': {
    title: 'Backend Development Assessment',
    sections: [
      {
        title: 'Technical Skills',
        questions: [
          {
            type: 'single-choice' as QuestionType,
            title: 'What is your primary backend language?',
            required: true,
            options: ['Node.js', 'Python', 'Java', 'Go', 'C#', 'Other']
          },
          {
            type: 'multi-choice' as QuestionType,
            title: 'Which databases have you worked with?',
            required: true,
            options: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch']
          },
          {
            type: 'long-text' as QuestionType,
            title: 'Explain how you would design a REST API for a blog system.',
            required: true,
            validation: { minLength: 200, maxLength: 1000 }
          }
        ]
      }
    ]
  },
  'Product Manager': {
    title: 'Product Management Assessment',
    sections: [
      {
        title: 'Product Strategy',
        questions: [
          {
            type: 'long-text' as QuestionType,
            title: 'How do you prioritize features in a product roadmap?',
            required: true,
            validation: { minLength: 100, maxLength: 800 }
          },
          {
            type: 'single-choice' as QuestionType,
            title: 'What framework do you use for product decisions?',
            required: true,
            options: ['RICE', 'MoSCoW', 'Kano Model', 'Jobs-to-be-Done', 'Other']
          }
        ]
      }
    ]
  }
}

export class DatabaseSeeder {
  // Seed the database with sample data
  static async seedAll(): Promise<void> {
    console.log('Starting database seeding...')

    // Clear existing data
    await DatabaseUtils.clearAll()

    // Seed jobs
    console.log('Seeding jobs...')
    const jobs = await this.seedJobs()

    // Seed candidates
    console.log('Seeding candidates...')
    await this.seedCandidates(jobs.map(job => job.id))

    // Seed assessments
    console.log('Seeding assessments...')
    await this.seedAssessments(jobs)

    const stats = await DatabaseUtils.getStats()
    console.log('Database seeding completed:', stats)
  }

  // Seed jobs (25 jobs with mixed active/archived status)
  static async seedJobs() {
    const jobs = []

    // Create multiple instances of each job template with variations
    for (let i = 0; i < 25; i++) {
      const template = SAMPLE_JOBS[i % SAMPLE_JOBS.length]
      const variation = Math.floor(i / SAMPLE_JOBS.length) + 1

      const jobData: CreateJobRequest = {
        ...template,
        title: variation > 1 ? `${template.title} ${variation}` : template.title
      }

      const job = await jobsService.create(jobData)

      // Randomly archive some jobs (about 20%)
      if (Math.random() < 0.2) {
        await jobsService.update(job.id, { status: 'archived' })
        job.status = 'archived'
      }

      jobs.push(job)
    }

    return jobs
  }

  // Seed candidates (1000 candidates with random job and stage assignments)
  static async seedCandidates(jobIds: string[]) {
    const candidates = []

    for (let i = 0; i < 1000; i++) {
      const name = generateRandomName()
      const email = generateRandomEmail(name)
      const jobId = getRandomElement(jobIds)
      const stage = getRandomElement(CANDIDATE_STAGES)

      const candidateData: CreateCandidateRequest = {
        name,
        email,
        jobId,
        stage
      }

      const candidate = await candidatesService.create(candidateData)

      // Add some random notes (30% chance)
      if (Math.random() < 0.3) {
        const noteCount = Math.floor(Math.random() * 3) + 1
        for (let j = 0; j < noteCount; j++) {
          const notes = [
            'Great communication skills during phone screen',
            'Strong technical background, good fit for the role',
            'Needs to improve on system design questions',
            'Very enthusiastic about the company mission',
            'Previous experience aligns well with our needs',
            'Salary expectations are within our budget',
            'Available to start immediately',
            'Concerns about remote work setup'
          ]

          await candidatesService.addNote({
            candidateId: candidate.id,
            content: getRandomElement(notes)
          })
        }
      }

      candidates.push(candidate)
    }

    return candidates
  }

  // Seed assessments (3 pre-built assessments with 10+ questions each)
  static async seedAssessments(jobs: any[]) {
    const assessments = []

    // Create assessments for specific job types
    for (const job of jobs) {
      const template = ASSESSMENT_TEMPLATES[job.title as keyof typeof ASSESSMENT_TEMPLATES]

      if (template) {
        const assessmentData: CreateAssessmentRequest = {
          jobId: job.id,
          title: template.title,
          sections: template.sections.map((section, sIndex) => ({
            title: section.title,
            questions: section.questions.map((question, qIndex) => ({
              ...question,
              id: crypto.randomUUID(),
              order: qIndex
            })),
            order: sIndex
          }))
        }

        const assessment = await assessmentsService.create(assessmentData)
        assessments.push(assessment)
      }
    }

    return assessments
  }

  // Check if database needs seeding
  static async needsSeeding(): Promise<boolean> {
    const stats = await DatabaseUtils.getStats()
    return stats.jobs === 0 && stats.candidates === 0
  }

  // Seed only if database is empty
  static async seedIfEmpty(): Promise<void> {
    if (await this.needsSeeding()) {
      await this.seedAll()
    }
  }
}

export const databaseSeeder = new DatabaseSeeder()