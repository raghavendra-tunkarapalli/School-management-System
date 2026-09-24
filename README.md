# Smart Attendance Management System

A robust, enterprise-grade Microservices-based Attendance and School Operations Management Platform built with **Spring Boot 3**, **Spring Cloud (Eureka & API Gateway)**, and a modern **React 19 + Vite** frontend.

---

## 🏛️ Architecture Overview

The system is architected as a distributed microservices ecosystem:

- **Service Registry**: Netflix Eureka Server (`:8761`)
- **API Gateway**: Spring Cloud Gateway with reactive routing & CORS configuration (`:8080`)
- **Frontend**: Modern React + Vite interactive dashboard (`:5173`)
- **Backend Microservices**: Specialized Spring Boot domain services for attendance, admissions, assignments, schedules, examinations, enquiries, and portals.

```
                  ┌──────────────────────────────┐
                  │    React Frontend (Vite)     │
                  │     http://localhost:5173    │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │   Spring Cloud API Gateway   │
                  │     http://localhost:8080    │
                  └──────┬───────────────┬───────┘
                         │               │
        ┌────────────────┘               └────────────────┐
        ▼                                                 ▼
┌───────────────┐                                 ┌───────────────┐
│ Eureka Server │                                 │ Microservices │
│    (:8761)    │                                 │   (Portals,   │
└───────────────┘                                 │  Attendance,  │
                                                  │  Admissions)  │
                                                  └───────────────┘
```

---

## 🚀 Services & Port Mapping

| Service Name | Port | Description |
| :--- | :--- | :--- |
| **Eureka Server** | `8761` | Service discovery & registration registry |
| **API Gateway** | `8080` | Central routing, load balancing & reverse proxy |
| **Teacher Attendance Service** | `8096` | Attendance logging, tracking, and analytics |
| **Student Portal Service** | `8093` | Student dashboard, profile, and academic tracking |
| **Teacher Portal Service** | `8098` | Teacher dashboard and class management |
| **Staff Portal Service** | `8090` | Administrative & staff operational workflows |
| **Staff Student Service** | `8091` | Student records and staff administrative directory |
| **Registration Service** | `8087` | User authentication, role assignment & registration |
| **Admission Service** | `8083` | Direct student admissions and enrollment processing |
| **Admin Admissions Service** | `8081` | Central administrative admission oversight |
| **Student Assignment Service** | `8092` | Homework and assignment submissions |
| **Student Schedule Service** | `8095` | Class timetables, routine, and exam schedules |
| **Staff Examination Service** | `8089` | Exam schedule publication and grade management |
| **Admin Enquiries Service** | `8082` | Administrative helpdesk and inquiry routing |
| **Parent Enquiry Service** | `8086` | Parent communication and inquiry portal |
| **Staff Enquiry Service** | `8088` | Staff helpdesk and internal requests |
| **Student Enquire Service** | `8094` | Student support query management |
| **Teacher Enquiry Service** | `8097` | Faculty inquiry and grievance redressal |

---

## 🛠️ Technology Stack

- **Backend**:
  - Java 21 / 17
  - Spring Boot 3.x
  - Spring Cloud (Eureka Server & Spring Cloud Gateway)
  - Spring Data JPA / REST APIs
  - Maven
- **Frontend**:
  - React 19
  - Vite
  - Lucide React Icons
  - Pure Modern CSS (Glassmorphism & Responsive layout)
- **Tooling & Automation**:
  - PowerShell Orchestration Scripts (`run_all.ps1`, `stop_all.ps1`)

---

## ⚡ Quick Start

### 1. Prerequisites
- **JDK 17+** (Java 21 recommended)
- **Node.js 18+** & `npm`
- **Maven 3.8+** (or bundled Maven wrapper)

### 2. Automated Launch (PowerShell)
Launch all backend microservices, the API gateway, Eureka server, and frontend in one command:

```powershell
.\run_all.ps1
```

To gracefully stop all running services:
```powershell
.\stop_all.ps1
```

### 3. Manual Step-by-Step Launch

1. **Start Eureka Server**:
   ```bash
   cd backend/eureka-server
   mvn spring-boot:run
   ```

2. **Start API Gateway**:
   ```bash
   cd backend/api-gateway
   mvn spring-boot:run
   ```

3. **Start Microservices**:
   Navigate to individual directories under `backend/` and run `mvn spring-boot:run`.

4. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🌐 Web Endpoints

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **API Gateway**: [http://localhost:8080](http://localhost:8080)
- **Eureka Dashboard**: [http://localhost:8761](http://localhost:8761)

---

## 📄 License
This project is licensed under the MIT License.
