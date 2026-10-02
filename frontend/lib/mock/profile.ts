import type { Session, StudentProfile } from '@/lib/types'

export const MOCK_PROFILE: StudentProfile = {
  id: 'stu_1024',
  firstName: 'Amina',
  lastName: 'Okafor',
  email: 'amina.okafor@example.edu',
  country: 'Nigeria',
  degreeLevel: 'Masters',
  fieldOfStudy: 'Computer Science',
  preferredCountries: ['United Kingdom', 'Germany', 'Switzerland', 'Sweden'],
  institution: 'University of Lagos',
  gpa: '3.8 / 4.0',
  graduationYear: '2025',
  englishTest: 'IELTS 7.5',
  bio: 'Software engineer interested in distributed systems and cloud infrastructure for public services.',
  preferences: {
    emailAlerts: true,
    deadlineReminders: true,
    fullyFundedOnly: false,
  },
}

export const MOCK_SESSION: Session = {
  userId: MOCK_PROFILE.id,
  name: `${MOCK_PROFILE.firstName} ${MOCK_PROFILE.lastName}`,
  email: MOCK_PROFILE.email,
  role: 'admin',
}

export const MOCK_SAVED_IDS = ['chevening-scholarship', 'eth-excellence-masters', 'daad-epos']

export const MOCK_RECENTLY_VIEWED_IDS = [
  'si-global-professionals',
  'gates-cambridge',
  'erasmus-mundus-jmd',
]
