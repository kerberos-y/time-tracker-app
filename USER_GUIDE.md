# Time Tracker - User Guide

## 🎯 Getting Started

### Prerequisites
- Node.js 20.20.0 or higher
- npm (comes with Node.js)

### Installation & Setup

1. **Navigate to the project directory**
```bash
cd d:\work\Time Tracker\time-tracker-app
```

2. **Install dependencies** (if not already done)
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open in browser**
- Local: http://localhost:3000
- Network: http://192.168.0.101:3000

## 📖 How to Use

### The Tracker Page (Home)

This is where you manage your daily time entries.

#### Starting a Timer
1. Enter a **Task Name** (e.g., "Development", "Testing")
2. Select a **Project** from the dropdown
3. Click **Start** button
4. The timer will begin counting in real-time
5. The header shows the active timer with duration

#### Stopping a Timer
1. Click the **Stop** button when you're done
2. The timer duration is automatically calculated
3. The entry is saved to the database

#### Editing an Entry
1. Find the entry you want to edit
2. Click the **Edit** button
3. Update:
   - Task name
   - Project
   - Duration (in HH:MM format)
4. Click **Save** to apply changes

#### Deleting an Entry
1. Find the entry you want to delete
2. Click the **Delete** button
3. Entry is removed immediately

#### Viewing Daily Summary
- At the top, you see a breakdown of time per project
- Shows total tracked time for each project today
- Includes project color indicator

### The Projects Page

Manage your projects and assign colors for organization.

#### Creating a New Project
1. Enter a **Project Name** (e.g., "Client A", "Internal")
2. Choose a **Color** using the color picker
3. Click **Add project** button
4. New project appears in the list

#### Editing a Project
1. Find the project in the list
2. Click the **Edit** button
3. Update name and/or color
4. Click **Save**

#### Deleting a Project
1. Find the project in the list
2. Click the **Delete** button
3. ⚠️ All time entries for this project will also be deleted
4. A confirmation dialog will appear

### The Reports Page

View and analyze your tracked time across different periods.

#### Viewing Reports by Period
1. Click one of: **day**, **week**, or **month**
2. The report updates to show:
   - **Totals by project**: Summary of time per project
   - **Entries**: List of all entries in that period
   - **Date range**: Start and end dates for the period

#### Understanding the Report
- **Totals by project**: Aggregated hours and minutes
- **Entries list**: Shows each entry with:
  - Task name
  - Project name
  - Duration
  - Timestamp

#### Exporting to CSV
1. Select the desired period
2. Click **Export CSV** button
3. File downloads as `report-{period}.csv`
4. Open in Excel, Google Sheets, or any spreadsheet app

### Header Status Bar

The header shows important information:
- **Navigation Links**: Switch between Tracker, Projects, Reports
- **Active Timer**: Shows current running task and duration
- **Status**: Displays "No active timer" when idle

## 💡 Tips & Tricks

### Task Suggestions
- Start typing a task name and you'll see suggestions from previous tasks
- Click any suggestion to quickly add it

### Time Format
- Use HH:MM format when manually entering duration
- Example: "01:30" for 1 hour 30 minutes

### Color Organization
- Use different colors for different clients or projects
- Makes visual reporting easier

### Regular Backups
- Data is stored in `/data/time-tracker.db`
- Consider backing this up regularly

### Keyboard Shortcuts
- Tab: Navigate between fields
- Enter: Submit forms
- Escape: Cancel editing

## ⚙️ Technical Details

### Database
- SQLite database at: `./data/time-tracker.db`
- Automatically created on first run
- Pre-populated with sample projects: "Internal", "Client A"

### Initial Projects
- **Internal** - Blue color (#0ea5e9) - Default project
- **Client A** - Green color (#10b981) - Sample client

### Time Tracking
- Entries are stored in UTC timestamps
- Duration is calculated in minutes
- Minimum entry duration: 1 minute

### Responsive Design
- Works on desktop (1920x1080+)
- Tablets (768px+)
- Mobile friendly layout
- All features available on all devices

## 🔧 Troubleshooting

### Server Won't Start
```bash
# Check if port 3000 is in use, then:
npm run dev
```

### Database Errors
```bash
# Rebuild native modules:
npm rebuild
```

### Missing Dependencies
```bash
# Reinstall all packages:
npm install
```

### Build Fails
```bash
# Clean build:
npm run build
# Or for development with rebuild:
npm run dev
```

## 📱 Features Summary

| Feature | Description |
|---------|-------------|
| ⏱️ Timer | Start/stop with auto-duration calculation |
| 📝 Entries | Create, read, update, delete time entries |
| 🏷️ Projects | Manage projects with custom colors |
| 📊 Reports | Daily, weekly, monthly analysis |
| 📥 Export | Download reports as CSV |
| 🎨 Colors | Visual organization with project colors |
| 💾 Storage | Persistent SQLite database |
| ⚡ Real-time | Reactive UI updates |
| 📱 Responsive | Works on desktop, tablet, mobile |
| 🖥️ Modern UI | Clean, professional interface |

## 🎓 Workflow Example

1. **Start your day**: Open http://localhost:3000
2. **Select project**: Choose from dropdown
3. **Name your task**: Enter what you're working on
4. **Start timer**: Click Start button
5. **Work normally**: Timer runs in background
6. **Stop when done**: Click Stop button
7. **Review**: See daily summary and totals
8. **Analyze**: Check reports for insights
9. **Export**: Download CSV for records

## 🚀 Advanced Usage

### For Project Managers
- Use daily reports to track team productivity
- Export weekly/monthly for stakeholder updates
- Color-code projects for quick visual reference

### For Freelancers
- Track billable hours per client
- Export reports for invoicing
- Maintain detailed time records

### For Personal Use
- Organize tasks by project
- Analyze time spending patterns
- Set goals based on reports

---

**Enjoy tracking your time effectively! 🎯**
