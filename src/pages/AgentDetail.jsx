import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import ReactMarkdown from 'react-markdown'
import { agentsApi, deploymentsApi, usersApi } from '../services/api'
import { useApiCall } from '../hooks/useApi'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Badge from '../components/ui/Badge'

export default function AgentDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, loginWithRedirect } = useAuth0()

  const { data: agent, loading, error, execute } = useApiCall(agentsApi.get)
  const { data: user, execute: fetchUser } = useApiCall(usersApi.me)
  const { execute: createDeployment, loading: deploying } = useApiCall(deploymentsApi.create)
  const { execute: updateUser } = useApiCall(usersApi.update)

  const [config, setConfig] = useState({})
  const [sshKey, setSshKey] = useState('')
  const [deployError, setDeployError] = useState(null)

  useEffect(() => {
    execute(slug)
  }, [execute, slug])

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser()
    }
  }, [isAuthenticated, fetchUser])

  useEffect(() => {
    if (user?.ssh_public_key) {
      setSshKey(user.ssh_public_key)
    }
  }, [user])

  useEffect(() => {
    if (agent?.config_schema?.properties) {
      const defaults = {}
      Object.entries(agent.config_schema.properties).forEach(([key, prop]) => {
        if (prop.default !== undefined) {
          defaults[key] = prop.default
        }
      })
      setConfig(defaults)
    }
  }, [agent])

  const handleConfigChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const handleDeploy = async () => {
    if (!isAuthenticated) {
      loginWithRedirect({ appState: { returnTo: window.location.pathname } })
      return
    }

    setDeployError(null)

    try {
      if (sshKey && sshKey !== user?.ssh_public_key) {
        await updateUser({ ssh_public_key: sshKey })
      }

      if (!sshKey) {
        setDeployError('SSH public key is required')
        return
      }

      const result = await createDeployment({
        agent_slug: slug,
        config,
      })

      navigate(`/dashboard/${result.id}`)
    } catch (err) {
      setDeployError(err.response?.data?.detail || 'Failed to deploy agent')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={() => navigate('/marketplace')}>Back to Marketplace</Button>
      </div>
    )
  }

  if (!agent) return null

  const schema = agent.config_schema || {}
  const properties = schema.properties || {}
  const price = agent.base_price / 100

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start space-x-6 mb-8">
          <div className="w-24 h-24 rounded-xl bg-gradient-accent flex items-center justify-center text-5xl flex-shrink-0">
            🦞
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
            <p className="text-gray-400 mb-3">{agent.description}</p>
            <Badge variant="info" className="text-base px-3 py-1">
              ${price}/month
            </Badge>
          </div>
        </div>

        {/* Description */}
        {agent.long_description && (
          <Card className="mb-8">
            <CardBody>
              <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-ul:text-gray-300 prose-li:text-gray-300 prose-code:text-accent-secondary prose-code:bg-bg-tertiary prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                <ReactMarkdown>{agent.long_description}</ReactMarkdown>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Configuration Form */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">Configuration</h2>
          </CardHeader>
          <CardBody className="space-y-6">
            {Object.entries(properties).map(([key, prop]) => (
              <ConfigField
                key={key}
                name={key}
                property={prop}
                value={config[key] || ''}
                onChange={(value) => handleConfigChange(key, value)}
                allConfig={config}
              />
            ))}
          </CardBody>
        </Card>

        {/* SSH Key */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">SSH Access</h2>
          </CardHeader>
          <CardBody>
            <p className="text-gray-400 text-sm mb-4">
              Provide your SSH public key to access the server. You can find it in{' '}
              <code className="text-accent-secondary">~/.ssh/id_rsa.pub</code> or{' '}
              <code className="text-accent-secondary">~/.ssh/id_ed25519.pub</code>
            </p>
            <textarea
              className="input min-h-[100px] font-mono text-sm"
              placeholder="ssh-rsa AAAA... or ssh-ed25519 AAAA..."
              value={sshKey}
              onChange={(e) => setSshKey(e.target.value)}
            />
          </CardBody>
        </Card>

        {/* Deploy Button */}
        {deployError && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {deployError}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleDeploy}
            loading={deploying}
            disabled={deploying}
          >
            {isAuthenticated ? 'Deploy Agent' : 'Login to Deploy'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ConfigField({ name, property, value, onChange, allConfig }) {
  const { type, title, description, format } = property

  if (property.dependsOn && property.options) {
    const dependsValue = allConfig[property.dependsOn]
    const options = property.options[dependsValue] || []

    return (
      <Select
        label={title || name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={options}
      />
    )
  }

  if (property.enum) {
    const options = property.enum.map((val) => ({
      value: val,
      label: property.enumLabels?.[val] || val,
    }))

    return (
      <Select
        label={title || name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={options}
      />
    )
  }

  return (
    <Input
      label={title || name}
      type={format === 'password' ? 'password' : 'text'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={description}
    />
  )
}
