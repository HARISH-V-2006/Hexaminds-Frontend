import { Navigate, Route, Routes } from 'react-router-dom'
import { SplashScreen } from '@/features/splash/SplashScreen'
import { LoginScreen } from '@/features/auth/LoginScreen'
import { GuestRoute, ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { RegistrationStep1Screen } from '@/features/registration/RegistrationStep1Screen'
import { RegistrationStep2Screen } from '@/features/registration/RegistrationStep2Screen'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginScreen />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegistrationStep1Screen />
          </GuestRoute>
        }
      />
      <Route
        path="/register/address"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <RegistrationStep2Screen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <PlaceholderPage titleKey="placeholders.customerHome" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <PlaceholderPage titleKey="placeholders.workerHome" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cooperative-admin"
        element={
          <ProtectedRoute allowedRoles={['cooperative_admin']}>
            <PlaceholderPage titleKey="placeholders.adminHome" />
          </ProtectedRoute>
        }
      />
      <Route path="/welcome" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
