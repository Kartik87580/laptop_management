# Software Requirements Specification (SRS)

## Laptop Repair Shop Management System (LRMS)

**Version:** 1.0
**Prepared By:** Kartik
**Date:** June 2026

---

# 1. Introduction

## 1.1 Purpose

The purpose of the Laptop Repair Shop Management System is to replace the traditional paper register used in laptop repair shops with a simple web-based application. The system will allow shop staff to record, manage, update, search, and track repair jobs efficiently.

---

## 1.2 Scope

The system will help the repair shop to:

* Record customer and laptop information
* Track repair status
* Maintain repair history
* Store estimated repair amount
* Search repair records quickly
* Generate printable job sheets
* View dashboard statistics
* Export repair records

The application is intended for use by shop owners and employees.

---

## 1.3 Definitions

| Term   | Description                         |
| ------ | ----------------------------------- |
| CRUD   | Create, Read, Update, Delete        |
| Job ID | Unique repair identification number |
| LRMS   | Laptop Repair Management System     |

---

# 2. Overall Description

## 2.1 Product Perspective

The application is a standalone web application replacing manual notebook entries.

---

## 2.2 Product Features

* User Login
* Dashboard
* Add Repair Entry
* View Repairs
* Search Repairs
* Update Repair Details
* Delete Repair Entry
* Track Repair Status
* Customer History
* Print Job Sheet
* Export Data

---

## 2.3 User Classes

### Admin

* Full system access
* Add/Edit/Delete repairs
* Manage settings
* Export data

### Employee

* Add repair entries
* Update repair status
* View repair records
* Print receipts

---

# 3. Functional Requirements

---

# FR-1 User Authentication

### Description

Users must log in before accessing the system.

### Inputs

* Username
* Password

### Outputs

* Successful Login
* Invalid Credentials

---

# FR-2 Dashboard

### Description

Display repair statistics.

### Information Displayed

* Total Repairs
* Pending Repairs
* Repairing
* Ready for Delivery
* Delivered
* Today's Repairs
* Recent Repair Entries

---

# FR-3 Add New Repair Entry

### Description

Store a new repair job.

### Customer Information

* Customer Name
* Mobile Number
* Alternate Mobile (Optional)

### Laptop Information

* Brand
* Model
* Serial Number
* Service Tag (Optional)

### Problem Information

* Problem Description

### Accessories Received

* Charger
* Laptop Bag
* Mouse
* Battery
* Other Accessories

### Repair Information

* Technician Name (Optional)
* Estimated Amount (₹)
* Repair Notes

### Status

Dropdown values

* Received
* Diagnosing
* Waiting for Parts
* Repairing
* Ready
* Delivered

### Date & Time

* Received Date
* Received Time

---

# FR-4 View Repair List

Display all repair jobs in a table.

### Columns

* Job ID
* Customer Name
* Brand
* Model
* Mobile Number
* Problem
* Status
* Estimated Amount
* Received Date
* Actions

Actions

* View
* Edit
* Delete

---

# FR-5 Search Repairs

Search using:

* Job ID
* Customer Name
* Mobile Number
* Laptop Brand
* Laptop Model
* Serial Number
* Status

---

# FR-6 Update Repair

Users can update:

* Customer Information
* Laptop Information
* Problem Description
* Estimated Amount
* Technician Name
* Repair Notes
* Repair Status

---

# FR-7 Delete Repair

Users can delete repair records after confirmation.

Confirmation Message

> Are you sure you want to delete this repair record?

---

# FR-8 Repair Details

Each repair page displays:

### Customer Information

* Name
* Phone Number

### Laptop Information

* Brand
* Model
* Serial Number
* Service Tag

### Repair Information

* Problem Description
* Accessories
* Technician
* Estimated Amount
* Repair Notes

### Status

Current repair status.

### Dates

* Received Date
* Received Time
* Delivery Date
* Delivery Time

---

# FR-9 Delivery

When repair is completed:

Store

* Delivery Date
* Delivery Time

Automatically change status to

* Delivered

---

# FR-10 Customer History

When searching a customer,

Display:

* Previous Repairs
* Previous Problems
* Previous Estimated Amounts
* Repair Dates

---

# FR-11 Repair Timeline

Maintain repair history.

Example

```text
Laptop Received

↓

Diagnosing

↓

Waiting for Parts

↓

Repairing

↓

Ready

↓

Delivered
```

---

# FR-12 Print Job Sheet

Generate a printable repair receipt.

Contains

* Shop Name
* Job ID
* Customer Name
* Phone Number
* Laptop Details
* Problem Description
* Estimated Amount
* Received Date
* Signature

---

# FR-13 Export Records

Export repair records as:

* Excel (.xlsx)
* PDF (.pdf)

---

# 4. Non-Functional Requirements

## Performance

* Page load time less than 2 seconds.
* Search results within 1 second.
---

## Reliability

* Automatic data saving.
* Prevent duplicate Job IDs.
* Prevent accidental deletion using confirmation dialog.


---

## Usability

* Simple interface.
* Responsive design.
* Easy navigation.
* Mobile-friendly.

---


---

# 5. Database Design

## Repair Table / Collection

| Field           | Type     |
| --------------- | -------- |
| id              | ObjectId |
| jobId           | String   |
| customerName    | String   |
| phone           | String   |
| alternatePhone  | String   |
| brand           | String   |
| model           | String   |
| serialNumber    | String   |
| serviceTag      | String   |
| problem         | Text     |
| accessories     | Array    |
| technician      | String   |
| estimatedAmount | Number   |
| repairNotes     | Text     |
| status          | String   |
| receivedDate    | Date     |
| receivedTime    | String   |
| deliveryDate    | Date     |
| deliveryTime    | String   |
| createdAt       | Date     |
| updatedAt       | Date     |

---

# 6. System Modules

```
Laptop Repair Management System

├── Login
│
├── Dashboard
│
├── Repair Management
│     ├── Add Repair
│     ├── View Repairs
│     ├── Edit Repair
│     ├── Delete Repair
│     ├── Repair Details
│     └── Search Repairs
│
├── Customer History
│
├── Reports
│     ├── Export Excel
│     └── Export PDF
│
└── Settings
```

---

# 7. User Interface Requirements

## Dashboard

Displays repair statistics and recent repair jobs.

---

## Add Repair Page

A form for entering new repair details.

---

## Repair List Page

Displays all repair jobs with search and filter options.

---

## Repair Details Page

Displays complete information for a selected repair.

---

## Edit Repair Page

Allows updating repair information.

---

# 8. Constraints

* Internet connection required.
* Modern web browser (Chrome, Edge, Firefox).
* MongoDB database.
* Only authorized users can access the system.

---

# 9. Future Enhancements

* SMS/WhatsApp notification to customers
* QR Code for each repair job
* Barcode printing
* Photo upload for laptop condition
* Customer digital signature
* Online repair status tracking
* Inventory/Spare parts management
* Multiple employee accounts with role-based access
* Email notifications

---

# 10. Technology Stack

| Component       | Technology               |
| --------------- | ------------------------ |
| Frontend        | React.js                 |
| Styling         | Tailwind CSS             |
| Backend         | Node.js + Express.js     |
| Database        | MongoDB                  |
| Authentication  | JWT                      |
| API Testing     | Postman                  |
| Version Control | Git & GitHub             |
| Deployment      | Docker + AWS EC2 + Nginx |

---

# 11. Expected Outcome

The Laptop Repair Shop Management System will replace manual paper records with a centralized digital system. It will enable repair shops to efficiently manage repair jobs, maintain customer history, track repair progress, estimate repair costs, generate job sheets, and quickly retrieve records through search and filtering, resulting in improved accuracy, reduced paperwork, and better customer service.
