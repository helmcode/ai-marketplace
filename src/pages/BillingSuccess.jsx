import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card, { CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function BillingSuccess() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="py-12">
      <div className="max-w-lg mx-auto px-4">
        <Card>
          <CardBody className="text-center py-12">
            <div className="text-6xl mb-6">&#x2705;</div>
            <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-gray-400 mb-2">
              Your box is being provisioned. This usually takes 1-2 minutes.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Redirecting to dashboard in {countdown}s...
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard Now
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
