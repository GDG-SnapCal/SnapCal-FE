import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import CalendarPage from './pages/CalendarPage'
import UploadPage from './pages/UploadPage'
import UploadSelectPage from './pages/UploadSelectPage'
import DuplicateSelectPage from './pages/DuplicateSelectPage'
import ClassifyResultPage from './pages/ClassifyResultPage'
import ImageEditPage from './pages/ImageEditPage'
import SharePage from './pages/SharePage'
import DayPhotoPage from './pages/DatePhotoPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/upload/select" element={<UploadSelectPage />} />
      <Route path="/upload/duplicates" element={<DuplicateSelectPage />} />
      <Route path="/upload/classify" element={<ClassifyResultPage />} />
      <Route path="/photo/:photoId/edit" element={<ImageEditPage />} />
      <Route path ="/calendar/:date" element = {<DayPhotoPage/>}/>
      <Route path="/share" element={<SharePage />} />
    </Routes>
  )
}
