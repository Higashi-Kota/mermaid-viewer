/**
 * Sample mermaid diagrams for testing various minimap scenarios
 */

import type { MessageKey } from "@mermaid-demo/messages"

export interface DiagramDefinition {
  readonly id: string
  readonly nameKey: MessageKey
  readonly descriptionKey: MessageKey
  readonly definition: string
}

export const SAMPLE_DIAGRAMS: readonly DiagramDefinition[] = [
  {
    id: "large-flowchart",
    nameKey: "diagram.largeFlowchart.name",
    descriptionKey: "diagram.largeFlowchart.description",
    definition: `flowchart TB
    subgraph Layer1[Input Layer]
        A1[User Request] --> B1[API Gateway]
        A2[Webhook] --> B1
        A3[Scheduled Job] --> B1
    end

    subgraph Layer2[Processing Layer]
        B1 --> C1[Auth Service]
        C1 --> D1[Request Validator]
        D1 --> E1{Route Decision}

        E1 -->|Read| F1[Read Handler]
        E1 -->|Write| F2[Write Handler]
        E1 -->|Delete| F3[Delete Handler]

        F1 --> G1[Cache Check]
        G1 -->|Hit| H1[Return Cached]
        G1 -->|Miss| H2[Query Database]

        F2 --> I1[Validate Data]
        I1 --> I2[Transform Data]
        I2 --> I3[Write to Database]
        I3 --> I4[Invalidate Cache]

        F3 --> J1[Soft Delete Check]
        J1 -->|Soft| J2[Mark Deleted]
        J1 -->|Hard| J3[Remove Record]
    end

    subgraph Layer3[Data Layer]
        H2 --> K1[(Primary DB)]
        I3 --> K1
        J2 --> K1
        J3 --> K1

        K1 --> L1[(Replica DB)]
        H1 --> M1[Response Builder]
        H2 --> M1
        I4 --> M1
        J2 --> M1
        J3 --> M1
    end

    subgraph Layer4[Output Layer]
        M1 --> N1[Response Formatter]
        N1 --> O1[Logging]
        O1 --> P1[Return Response]
    end`,
  },
  {
    id: "small-diagram",
    nameKey: "diagram.smallDiagram.name",
    descriptionKey: "diagram.smallDiagram.description",
    definition: `flowchart LR
    A[Start] --> B[Process] --> C[End]`,
  },
  {
    id: "wide-diagram",
    nameKey: "diagram.wideDiagram.name",
    descriptionKey: "diagram.wideDiagram.description",
    definition: `flowchart LR
    A[Step 1] --> B[Step 2] --> C[Step 3] --> D[Step 4] --> E[Step 5] --> F[Step 6] --> G[Step 7] --> H[Step 8] --> I[Step 9] --> J[Step 10] --> K[Step 11] --> L[Step 12]

    A --> A1[Sub 1]
    C --> C1[Sub 3]
    E --> E1[Sub 5]
    G --> G1[Sub 7]
    I --> I1[Sub 9]
    K --> K1[Sub 11]`,
  },
  {
    id: "tall-diagram",
    nameKey: "diagram.tallDiagram.name",
    descriptionKey: "diagram.tallDiagram.description",
    definition: `flowchart TB
    A[Initialize] --> B[Load Config]
    B --> C[Validate Config]
    C --> D[Setup Database]
    D --> E[Create Tables]
    E --> F[Seed Data]
    F --> G[Start Server]
    G --> H[Register Routes]
    H --> I[Setup Middleware]
    I --> J[Enable Logging]
    J --> K[Health Check]
    K --> L[Ready]
    L --> M[Accept Connections]
    M --> N[Process Requests]
    N --> O[Send Responses]
    O --> P[Log Activity]
    P --> Q[Monitor Performance]
    Q --> R[Report Metrics]`,
  },
  {
    id: "sequence-diagram",
    nameKey: "diagram.sequenceDiagram.name",
    descriptionKey: "diagram.sequenceDiagram.description",
    definition: `sequenceDiagram
    participant User
    participant Browser
    participant API
    participant Auth
    participant Database

    User->>Browser: Click Login
    Browser->>API: POST /login
    API->>Auth: Validate credentials
    Auth->>Database: Query user
    Database-->>Auth: User data
    Auth-->>API: JWT Token
    API-->>Browser: Set cookie
    Browser-->>User: Redirect to dashboard

    User->>Browser: Request protected resource
    Browser->>API: GET /resource (with JWT)
    API->>Auth: Verify JWT
    Auth-->>API: Token valid
    API->>Database: Fetch resource
    Database-->>API: Resource data
    API-->>Browser: JSON response
    Browser-->>User: Display data`,
  },
  {
    id: "class-diagram",
    nameKey: "diagram.classDiagram.name",
    descriptionKey: "diagram.classDiagram.description",
    definition: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound() void
        +move() void
    }

    class Dog {
        +String breed
        +bark() void
        +fetch() void
    }

    class Cat {
        +boolean isIndoor
        +meow() void
        +scratch() void
    }

    class Bird {
        +double wingspan
        +fly() void
        +sing() void
    }

    class Fish {
        +String waterType
        +swim() void
    }

    class Owner {
        +String name
        +String address
        +adopt(Animal) void
        +feed(Animal) void
    }

    class Shelter {
        +String name
        +List~Animal~ animals
        +addAnimal(Animal) void
        +removeAnimal(Animal) void
    }

    Animal <|-- Dog
    Animal <|-- Cat
    Animal <|-- Bird
    Animal <|-- Fish
    Owner "1" --> "*" Animal : owns
    Shelter "1" --> "*" Animal : houses`,
  },
  {
    id: "state-diagram",
    nameKey: "diagram.stateDiagram.name",
    descriptionKey: "diagram.stateDiagram.description",
    definition: `stateDiagram-v2
    [*] --> Idle

    Idle --> Loading : fetch()
    Loading --> Success : data received
    Loading --> Error : request failed

    Success --> Idle : reset()
    Success --> Loading : refresh()
    Success --> Editing : edit()

    Error --> Idle : dismiss()
    Error --> Loading : retry()

    Editing --> Saving : save()
    Editing --> Success : cancel()

    Saving --> Success : saved
    Saving --> Error : save failed

    state Success {
        [*] --> Viewing
        Viewing --> Details : expand()
        Details --> Viewing : collapse()
    }`,
  },
  {
    id: "er-diagram",
    nameKey: "diagram.erDiagram.name",
    descriptionKey: "diagram.erDiagram.description",
    definition: `erDiagram
    USER ||--o{ ORDER : places
    USER {
        int id PK
        string email
        string name
        datetime created_at
    }

    ORDER ||--|{ ORDER_ITEM : contains
    ORDER {
        int id PK
        int user_id FK
        datetime ordered_at
        string status
        decimal total
    }

    ORDER_ITEM }|--|| PRODUCT : references
    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price
    }

    PRODUCT ||--o{ REVIEW : has
    PRODUCT {
        int id PK
        string name
        string description
        decimal price
        int stock
    }

    USER ||--o{ REVIEW : writes
    REVIEW {
        int id PK
        int user_id FK
        int product_id FK
        int rating
        string comment
        datetime created_at
    }`,
  },
  {
    id: "gantt-chart",
    nameKey: "diagram.ganttChart.name",
    descriptionKey: "diagram.ganttChart.description",
    definition: `gantt
    title Project Development Schedule
    dateFormat YYYY-MM-DD
    section Planning
        Requirements    :a1, 2024-01-01, 14d
        Design          :a2, after a1, 10d
    section Development
        Frontend        :b1, after a2, 21d
        Backend         :b2, after a2, 28d
        API Integration :b3, after b1, 7d
    section Testing
        Unit Tests      :c1, after b2, 7d
        Integration     :c2, after c1, 7d
        UAT             :c3, after c2, 5d
    section Deployment
        Staging         :d1, after c3, 3d
        Production      :d2, after d1, 2d`,
  },
  {
    id: "user-journey",
    nameKey: "diagram.userJourney.name",
    descriptionKey: "diagram.userJourney.description",
    definition: `journey
    title User Purchase Journey
    section Discovery
        Visit Homepage: 5: User
        Browse Products: 4: User
        Read Reviews: 4: User
    section Selection
        Add to Cart: 5: User
        Compare Items: 3: User
        Remove Item: 2: User
    section Checkout
        Enter Address: 3: User
        Choose Payment: 4: User
        Confirm Order: 5: User
    section Post-Purchase
        Track Order: 4: User
        Receive Package: 5: User
        Write Review: 3: User`,
  },
  {
    id: "pie-chart",
    nameKey: "diagram.pieChart.name",
    descriptionKey: "diagram.pieChart.description",
    definition: `pie showData
    title Browser Market Share
    "Chrome" : 65
    "Safari" : 19
    "Firefox" : 8
    "Edge" : 5
    "Others" : 3`,
  },
  {
    id: "requirement-diagram",
    nameKey: "diagram.requirementsDiagram.name",
    descriptionKey: "diagram.requirementsDiagram.description",
    // biome-ignore format: Mermaid requirementDiagram requires specific indentation
    definition:
`requirementDiagram

    requirement user_auth {
    id: 1
    text: System shall authenticate users.
    risk: high
    verifymethod: test
    }

    requirement data_encrypt {
    id: 2
    text: Data shall be encrypted at rest.
    risk: high
    verifymethod: inspection
    }

    element auth_module {
    type: module
    }

    element crypto_module {
    type: module
    }

    auth_module - satisfies -> user_auth
    crypto_module - satisfies -> data_encrypt`,
  },
  {
    id: "git-graph",
    nameKey: "diagram.gitGraph.name",
    descriptionKey: "diagram.gitGraph.description",
    definition: `gitGraph
    commit id: "Initial"
    commit id: "Add README"
    branch develop
    checkout develop
    commit id: "Setup project"
    commit id: "Add components"
    branch feature/auth
    checkout feature/auth
    commit id: "Add login"
    commit id: "Add logout"
    checkout develop
    merge feature/auth
    branch feature/api
    checkout feature/api
    commit id: "Add endpoints"
    checkout develop
    merge feature/api
    checkout main
    merge develop tag: "v1.0.0"
    commit id: "Hotfix"`,
  },
  {
    id: "mindmap",
    nameKey: "diagram.mindmap.name",
    descriptionKey: "diagram.mindmap.description",
    definition: `mindmap
    root((Web Development))
        Frontend
            HTML
            CSS
                Flexbox
                Grid
            JavaScript
                React
                Vue
                Angular
        Backend
            Node.js
            Python
            Go
        Database
            SQL
                PostgreSQL
                MySQL
            NoSQL
                MongoDB
                Redis
        DevOps
            Docker
            Kubernetes
            CI/CD`,
  },
  {
    id: "timeline",
    nameKey: "diagram.timeline.name",
    descriptionKey: "diagram.timeline.description",
    definition: `timeline
    title History of Web Development
    section 1990s
        1991 : First website created
        1995 : JavaScript introduced
        1996 : CSS released
    section 2000s
        2004 : Web 2.0 era begins
        2006 : jQuery released
        2008 : Chrome browser launched
    section 2010s
        2010 : Node.js released
        2013 : React introduced
        2014 : Vue.js released
    section 2020s
        2020 : Tailwind CSS popularity
        2022 : AI coding assistants
        2024 : Web Components mature`,
  },
  {
    id: "quadrant-chart",
    nameKey: "diagram.quadrantChart.name",
    descriptionKey: "diagram.quadrantChart.description",
    definition: `quadrantChart
    title Task Priority Matrix
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Do First
    quadrant-2 Schedule
    quadrant-3 Delegate
    quadrant-4 Eliminate
    Bug fixes: [0.2, 0.8]
    New feature: [0.7, 0.9]
    Documentation: [0.3, 0.4]
    Refactoring: [0.6, 0.5]
    UI polish: [0.4, 0.3]
    Performance: [0.8, 0.7]`,
  },
  {
    id: "sankey",
    nameKey: "diagram.sankeyDiagram.name",
    descriptionKey: "diagram.sankeyDiagram.description",
    definition: `sankey-beta
    Traffic,Homepage,500
    Traffic,Products,300
    Traffic,Blog,200
    Homepage,Products,200
    Homepage,Signup,150
    Homepage,Exit,150
    Products,Cart,180
    Products,Exit,120
    Cart,Checkout,140
    Cart,Exit,40
    Checkout,Purchase,120
    Checkout,Exit,20`,
  },
  {
    id: "xy-chart",
    nameKey: "diagram.xyChart.name",
    descriptionKey: "diagram.xyChart.description",
    definition: `xychart-beta
    title "Monthly Sales 2024"
    x-axis [Jan, Feb, Mar, Apr, May, Jun]
    y-axis "Revenue (USD)" 0 --> 50000
    bar [15000, 22000, 18000, 32000, 28000, 45000]
    line [12000, 20000, 17000, 30000, 26000, 42000]`,
  },
  {
    id: "c4-diagram",
    nameKey: "diagram.c4Diagram.name",
    descriptionKey: "diagram.c4Diagram.description",
    definition: `C4Context
    title System Context Diagram
    Person(user, "User", "A user of the system")
    System(web, "Web Application", "Main web interface")
    System(api, "API Server", "Backend services")
    System_Ext(payment, "Payment Gateway", "External payment")
    System_Ext(email, "Email Service", "Notification emails")

    Rel(user, web, "Uses", "HTTPS")
    Rel(web, api, "Calls", "JSON/HTTPS")
    Rel(api, payment, "Processes payments")
    Rel(api, email, "Sends notifications")`,
  },
]

export function getDiagramById(id: string): DiagramDefinition | undefined {
  return SAMPLE_DIAGRAMS.find((d) => d.id === id)
}

/**
 * Creates a custom diagram definition (used when restoring from URL)
 */
export function createCustomDiagram(definition: string): DiagramDefinition {
  return {
    id: "custom",
    nameKey: "diagram.custom.name",
    descriptionKey: "diagram.custom.description",
    definition,
  }
}
