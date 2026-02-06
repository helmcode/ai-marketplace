import { Link, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Button from '../components/ui/Button'

export default function Home() {
  const { isAuthenticated } = useAuth0()

  // Redirect to dashboard if authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-accent-primary/10 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Deploy <span className="gradient-text">AI Agents</span>
              <br />with One Click
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Pre-configured AI agents ready to deploy on your own infrastructure.
              No setup required. Full control over your data.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/marketplace">
                <Button size="lg">Browse Agents</Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="outline" size="lg">Learn More</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose <span className="gradient-text">Boxes</span>?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🚀"
              title="One-Click Deploy"
              description="Select an agent, configure it, and deploy. Your AI assistant is ready in minutes."
            />
            <FeatureCard
              icon="🔒"
              title="Full Control"
              description="Your data stays on your server. SSH access included for advanced customization."
            />
            <FeatureCard
              icon="⚡"
              title="Pre-Configured"
              description="Agents come ready to use with sensible defaults. Customize as needed."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-surface-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="card p-12 glow-border">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-400 mb-8">
              Browse our marketplace and deploy your first AI agent today.
            </p>
            <Link to="/marketplace">
              <Button size="lg">View Available Agents</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="card p-6 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}
