import React, { useState } from 'react'

import { EmailModal } from './EmailModal'
import { OtpModal } from './OtpModal'

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  return userEmail ? (
    <OtpModal 
      email={userEmail} 
      onClose={onClose} 
      onBackToEmail={() => setUserEmail(null)} 
      onSuccess={onSuccess}
    />
  ) : (
    <EmailModal
      onClose={onClose}
      onEmailSent={(email) => setUserEmail(email)}
    />
  )
}