# UI Demo: Cluster Setup Wizard

This directory contains the user interface for the cluster creation platform. It abstracts the underlying Terraform and Batch job complexities into a user-friendly, multi-step wizard.

## Setup Flows

The UI supports two main cloud providers: AWS and GCP. Both follow a similar architectural pattern but use cloud-specific components and validation logic.

### AWS Setup Flow

```mermaid
graph TD
    Start((Start)) --> Provider[Provider Selection]
    Provider -->|Select AWS| Cloud[AWS Cloud Setup]
    Cloud -->|Next| Cluster[AWS Cluster Setup]
    Cluster -->|Next| Compute[AWS Compute Strategy]
    Compute -->|Next| Review[AWS Final Review]
    Review -->|Success| Complete((Finish))

    subgraph AWS Paths
        AWS1[/aws/cloud-setup/]
        AWS2[/aws/cluster-setup/]
        AWS3[/aws/compute-strategy/]
        AWS4[/aws/review/]
    end

    style Provider fill:#f9f,stroke:#333,stroke-width:2px
    style Cloud fill:#FF9900,stroke:#232F3E,color:white
    style Cluster fill:#FF9900,stroke:#232F3E,color:white
    style Compute fill:#FF9900,stroke:#232F3E,color:white
    style Review fill:#FF9900,stroke:#232F3E,color:white
```

### GCP Setup Flow

```mermaid
graph TD
    Start((Start)) --> Provider[Provider Selection]
    Provider -->|Select GCP| Cloud[GCP Cloud Setup]
    Cloud -->|Next| Cluster[GCP Cluster Setup]
    Cluster -->|Next| Compute[GCP Compute Strategy]
    Compute -->|Next| Review[GCP Final Review]
    Review -->|Launch| Deploy((Deploy Cluster))

    subgraph "GCP Wizard Pages"
        Cloud
        Cluster
        Compute
        Review
    end

    style Provider fill:#f9f,stroke:#333,stroke-width:2px
    style Cloud fill:#4285F4,stroke:#EA4335,color:white
    style Cluster fill:#4285F4,stroke:#34A853,color:white
    style Compute fill:#4285F4,stroke:#FBBC05,color:white
    style Review fill:#4285F4,stroke:#4285F4,color:white
```

## Running Locally

1. `cd ui`
2. `npm install`
3. `npm run dev`
4. Visit `http://localhost:3000/musical-couscous/`

*Note: The `basePath` is currently set to `/musical-couscous/` in `next.config.mjs`.*
