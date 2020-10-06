# Solution for the example interview challenge

This is a full-stack application for the internal operations team to resolve spam requests comming from some main service.

## Main assumptions and architectural decisions

- The functionality is implemented as a separate microservice (other system maybe MSA-based or monolithic)
- The master system for the main domain entity - Report, - is some other service
- To provide better latency store the data in a private microservice database
- Use eventual consistency model to synchronize with the master system
- Use MongoDB as the database of choice. Justification: good fit for the domain data model, low development and operational cost for sharding and replication if future scalability is required
- Use ayncrhonous communication via the message broker to synchronize the data with other services
- Use RabbitMQ as a message broker
- Use Transactional Outbox and Polling publisher patterns to provide an atomic database write and message send. Alternatives:
  - use CQRS and Even Sourcing model
  - do not use local persistent database at all and proxy all data from the master system
  - Use Transaction Log Tailing instead of Polling Publisher (MongoDB provides Change Streams functionallity)
- Assume there is some dedicated authentication service with web UI that can be hosted under the common domain. In a development environment there's a mock implementation in place of it.
- Token-based authentication. Use JWT.
- Role-based authorization. 
- Assume there is an API Gateway service that proxies all API requests for the services and does SSL termination, request throttling, etc.
- Zero Trust policy decision: the service authenticates all API requests via JWT validation. The secret for the validation is injected into the service environment. Use symmetric cryptographic algorithm.
- Frontend application is implemented as a Single Page Application.
- Development stand

## Runbook

### Requirements:
- Docker, version >=9.03.8
- docker-compose, version >=1.25.4
- npm, version >=6.14.6
- node.js, version >=v11.11.0

### Init

```bash
cd <project-root>/backend
npm i --dev
npm run build
```

### Run the service on the development stand:

```bash
npm run build
npm run up 
```

Go to http://localhost:8080

### Run tests:

```bash
npm run build
npm run test
```

### Run dev server:

```bash
npm run dev
```

Go to http://localhost:3000
