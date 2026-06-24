export type PhotoCategory = '음식' | '패션' | '풍경' | '운동' | '일상' | '미분류'

export interface User {
  userId: string
  name: string
  email: string
  profileImageUrl: string | null
}

export interface Photo {
  photoId: string
  url: string
  takenAt: string
}

export interface DuplicateGroup {
  groupId: string
  takenAt: string
  photos: Photo[]
  aiRecommendedPhotoId: string
  selectedPhotoId: string | null
}

export interface ClassifiedPhoto {
  photoId: string
  url: string
  takenAt: string
  category: PhotoCategory
}

export interface CalendarDateEntry {
  count: number
  representativePhoto: {
    photoId: string
    thumbnailUrl: string
    category: string
    categoryColor: string
  }
}

export interface ApiError {
  code: string
  message: string
  field?: string
}
