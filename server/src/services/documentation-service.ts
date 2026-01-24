// =============================================================================
// DOCUMENTATION SERVICE
// Following CodeBakers pattern 00-core.md
// Comprehensive help and documentation system
// =============================================================================

export interface DocArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
  order: number;
}

export interface DocCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Documentation categories
export const DOC_CATEGORIES: DocCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Learn the basics of using the SAM.gov Opportunities App',
    icon: '🚀',
  },
  {
    id: 'features',
    name: 'Features',
    description: 'Detailed guides for all application features',
    icon: '⭐',
  },
  {
    id: 'auto-monitoring',
    name: 'Auto-Monitoring',
    description: 'Automatic opportunity tracking and alerts',
    icon: '🔔',
  },
  {
    id: 'ai-scoring',
    name: 'AI Scoring',
    description: 'Understanding opportunity scoring and ranking',
    icon: '🤖',
  },
  {
    id: 'contracting',
    name: 'Government Contracting',
    description: 'Best practices for federal contracting',
    icon: '🏛️',
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Common issues and solutions',
    icon: '🔧',
  },
];

// Comprehensive documentation articles
export const DOC_ARTICLES: DocArticle[] = [
  // Getting Started
  {
    id: 'quick-start',
    title: 'Quick Start Guide',
    category: 'getting-started',
    keywords: ['setup', 'start', 'begin', 'introduction'],
    order: 1,
    content: `# Quick Start Guide

Welcome to the SAM.gov Contracting Opportunities Application!

## Step 1: Create Your Company Profile

The first thing you should do is create your company profile. This enables AI scoring and helps you prioritize opportunities.

1. Navigate to "Company Profile" in the menu
2. Fill in your company name (required)
3. Add your NAICS codes (required) - these are the industries you work in
4. Add certifications if applicable (8(a), HUBZone, SDVOSB, etc.)
5. Fill in contact information and capabilities
6. Save your profile

## Step 2: Subscribe to NAICS Codes

Set up automatic notifications for opportunities in your industry:

1. Go to "Notifications" in the menu
2. Click "Add Subscription"
3. Enter a NAICS code you want to track
4. Choose notification frequency (daily or weekly)
5. Save your subscription

## Step 3: Search for Opportunities

Start exploring opportunities right away:

1. Go to "Search" in the menu
2. Enter a NAICS code
3. Optionally set a date range
4. Click "Search"
5. Browse results and click for details

## Step 4: Check "New Today"

Every day, check the "New Today" section to see fresh opportunities:

1. Go to "Opportunities" → "New Today"
2. Review opportunities flagged as new
3. AI scores help you prioritize (70+ is a good match)
4. Save interesting opportunities for later

That's it! You're ready to find federal contracting opportunities.`,
  },
  {
    id: 'naics-codes',
    title: 'Understanding NAICS Codes',
    category: 'getting-started',
    keywords: ['naics', 'codes', 'industry', 'classification'],
    order: 2,
    content: `# Understanding NAICS Codes

NAICS (North American Industry Classification System) codes are 6-digit numbers that classify businesses by industry.

## Why NAICS Codes Matter

- Federal agencies use NAICS codes to categorize contracts
- You must be registered for the right NAICS codes in SAM.gov
- Opportunities are often specific to certain NAICS codes

## Common NAICS Codes

### Engineering & Technical
- **541330** - Engineering Services
- **541340** - Drafting Services
- **541350** - Building Inspection Services

### IT & Computer Services
- **541511** - Custom Computer Programming
- **541512** - Computer Systems Design Services
- **541513** - Computer Facilities Management
- **541519** - Other Computer Related Services

### Consulting
- **541611** - Administrative Management Consulting
- **541618** - Other Management Consulting
- **541990** - All Other Professional Services

### Construction
- **236220** - Commercial and Institutional Building Construction
- **237310** - Highway, Street, and Bridge Construction

## How to Find Your NAICS Code

1. Visit [census.gov/naics](https://www.census.gov/naics/)
2. Search by keyword for your industry
3. Review the descriptions carefully
4. You can have multiple NAICS codes

## Registering Your NAICS Codes

Register your NAICS codes in SAM.gov:
1. Log into SAM.gov
2. Go to your entity registration
3. Add relevant NAICS codes
4. Designate your primary NAICS code`,
  },

  // Features
  {
    id: 'opportunity-search',
    title: 'Searching for Opportunities',
    category: 'features',
    keywords: ['search', 'find', 'opportunities', 'naics'],
    order: 1,
    content: `# Searching for Opportunities

The search feature lets you find federal contracting opportunities by NAICS code.

## Basic Search

1. Navigate to the "Search" page
2. Enter a 6-digit NAICS code (e.g., "541330")
3. Click "Search"

## Advanced Search

### Date Range Filtering

Filter opportunities by posted date:

- **Posted From**: Start date for opportunity postings
- **Posted To**: End date for opportunity postings

Example: Search for opportunities posted in the last 30 days.

### Understanding Results

Each opportunity shows:
- **Title**: Name of the contracting opportunity
- **Notice ID**: Unique identifier
- **Solicitation Number**: Official solicitation number
- **Department**: Government agency
- **Posted Date**: When it was posted to SAM.gov
- **Response Deadline**: When responses are due
- **Description**: Summary of requirements
- **Link**: Direct link to full details on SAM.gov

## Tips for Better Search Results

1. **Use Multiple NAICS Codes**: Don't limit yourself to one industry
2. **Search Regularly**: New opportunities are posted daily
3. **Check "New Today"**: Easier than manual searching
4. **Save Interesting Opportunities**: Use the save feature to track them`,
  },
  {
    id: 'saving-opportunities',
    title: 'Saving and Managing Opportunities',
    category: 'features',
    keywords: ['save', 'bookmark', 'notes', 'manage'],
    order: 2,
    content: `# Saving and Managing Opportunities

Save opportunities you're interested in for easy access later.

## How to Save an Opportunity

1. Search for or view an opportunity
2. Click the "Save" button
3. Optionally add personal notes
4. The opportunity is now in your "Saved" list

## Managing Saved Opportunities

### View Saved Opportunities

Navigate to "Saved Opportunities" to see all saved items.

### Add Notes

Click on a saved opportunity to:
- View full details
- Add or edit your personal notes
- Track your progress (e.g., "Draft started", "Submitted")

### Remove from Saved

Click the "Remove" button to delete from your saved list.

## Export Saved Opportunities

Export your saved opportunities to various formats:

1. Go to "Saved Opportunities"
2. Select opportunities (or select all)
3. Click "Export"
4. Choose format:
   - **CSV**: For spreadsheets
   - **PDF**: For printing or sharing
   - **Excel**: For advanced analysis

## Best Practices

- **Add Notes Immediately**: Record why you saved it
- **Track Deadlines**: Note response deadlines
- **Regular Review**: Check your saved list weekly
- **Clean Up**: Remove outdated or unsuitable opportunities`,
  },
  {
    id: 'exports',
    title: 'Exporting Opportunities',
    category: 'features',
    keywords: ['export', 'csv', 'pdf', 'excel', 'download'],
    order: 3,
    content: `# Exporting Opportunities

Export opportunities to CSV, PDF, or Excel for offline use, sharing, or analysis.

## Export Formats

### CSV (Comma-Separated Values)
- Opens in Excel, Google Sheets, or text editors
- Best for: Data analysis, spreadsheets
- Includes: All opportunity fields

### PDF (Portable Document Format)
- Formatted document with all details
- Best for: Printing, sharing, archiving
- Includes: Formatted opportunity information

### Excel (XLSX)
- Native Excel format
- Best for: Advanced spreadsheet work
- Includes: All fields in structured table

## How to Export

### From Search Results

1. Search for opportunities
2. Click "Export Results"
3. Choose format
4. File downloads automatically

### From Saved Opportunities

1. Go to "Saved Opportunities"
2. Select opportunities to export
3. Click "Export Selected"
4. Choose format

## What's Included

Each export contains:
- Notice ID and Solicitation Number
- Title and Description
- Department/Agency
- Posted Date and Response Deadline
- NAICS Code
- Link to full details on SAM.gov
- Your personal notes (if saved)

## Tips

- **Export Regularly**: Keep offline backups
- **Use Excel for Analysis**: Sort by deadline, score, etc.
- **PDF for Proposals**: Reference when writing proposals
- **Share with Team**: Send exported data to colleagues`,
  },

  // Auto-Monitoring
  {
    id: 'auto-monitoring-overview',
    title: 'Auto-Monitoring Overview',
    category: 'auto-monitoring',
    keywords: ['auto', 'monitoring', 'automatic', 'hourly', 'new-today'],
    order: 1,
    content: `# Auto-Monitoring System

The auto-monitoring system automatically tracks SAM.gov for new opportunities, so you never miss anything.

## How It Works

### Hourly Polling

- System checks SAM.gov **every hour** (at :00 minutes)
- Searches for opportunities in your subscribed NAICS codes
- Saves new opportunities automatically
- Marks them as "New Today"

### Daily Reset

- At midnight, the "New Today" flags reset
- This ensures you always see fresh opportunities
- Previous days' opportunities remain saved

## Key Features

### 1. Automatic Saving
All discovered opportunities are saved to the database automatically. You don't need to do anything.

### 2. Smart Deduplication
The system uses unique Notice IDs to prevent duplicates. Each opportunity is saved only once.

### 3. "New Today" Tracking
Opportunities flagged as "new" appear in the "New Today" section. Check this daily for fresh matches.

### 4. Email Notifications
If configured, you'll receive email alerts for new opportunities matching your subscriptions.

## Setting Up Auto-Monitoring

1. **Create Notification Subscriptions**
   - Go to "Notifications"
   - Add NAICS codes you want to track
   - Mark subscriptions as "active"

2. **Check "New Today" Daily**
   - Go to "Opportunities" → "New Today"
   - Review fresh opportunities
   - Save interesting ones for follow-up

3. **Configure Email (Optional)**
   - Email notifications require setup
   - Contact support for email configuration

## Benefits

- ✅ Never miss an opportunity
- ✅ No manual checking needed
- ✅ Always up-to-date
- ✅ Focus on evaluation, not searching`,
  },
  {
    id: 'new-today',
    title: 'Using "New Today"',
    category: 'auto-monitoring',
    keywords: ['new', 'today', 'fresh', 'recent'],
    order: 2,
    content: `# Using "New Today"

"New Today" shows opportunities discovered since midnight. Check it daily to stay current.

## How to Access

1. Navigate to "Opportunities" in the menu
2. Click "New Today"
3. View opportunities flagged as new

## What You'll See

Each opportunity shows:
- **AI Score** (if company profile configured)
- **Title and Notice ID**
- **Department/Agency**
- **Posted Date and Deadline**
- **Quick Actions** (Save, View Details)

## Filtering "New Today"

### By NAICS Code
Filter to see only specific industries:
- Select NAICS code from dropdown
- Or view "All NAICS Codes"

### By AI Score
Sort by score to prioritize:
- 90-100: Excellent match
- 70-89: Good match
- 50-69: Moderate match
- Below 50: Poor match

## Daily Workflow

### Morning Routine (Recommended)

1. **Check "New Today"**
   Review opportunities discovered overnight

2. **Sort by AI Score**
   Focus on highest-scoring opportunities first

3. **Save Promising Ones**
   Save opportunities worth pursuing

4. **Add Notes**
   Record initial thoughts or concerns

5. **Review Full Details**
   Read full solicitation on SAM.gov for top matches

## Tips

- **Set a Daily Reminder**: Check at the same time each day
- **Prioritize by Score**: Focus on 70+ scores
- **Act Fast**: Good opportunities get competitive quickly
- **Check on Weekends**: Federal agencies post anytime`,
  },

  // AI Scoring
  {
    id: 'ai-scoring-explained',
    title: 'How AI Scoring Works',
    category: 'ai-scoring',
    keywords: ['ai', 'scoring', 'ranking', 'match', 'priority'],
    order: 1,
    content: `# How AI Scoring Works

AI Scoring analyzes opportunities and assigns a 0-100 score based on your company's fit.

## Scoring Factors

### 1. NAICS Code Match (40 points)
- Does the opportunity's NAICS code match your company's codes?
- **40 points**: Exact match
- **0 points**: No match

### 2. Certification Match (30 points)
- Does the opportunity require certifications you have?
- Examples: 8(a), HUBZone, SDVOSB, WOSB
- **30 points**: Required certifications matched
- **0 points**: Don't have required certifications

### 3. Capability Match (30 points)
- Does the work match your capabilities and experience?
- AI analyzes opportunity description vs. your company profile
- **30 points**: Strong capability alignment
- **15 points**: Moderate alignment
- **0 points**: Poor alignment

## Score Interpretation

### 90-100: Excellent Match
- All factors align perfectly
- Strongly consider pursuing
- You're likely competitive

### 70-89: Good Match
- Most factors align
- Worth serious consideration
- Review carefully before deciding

### 50-69: Moderate Match
- Some factors align
- May be viable with partnering
- Evaluate carefully

### Below 50: Poor Match
- Few factors align
- Likely not a good fit
- Consider only if strategic

## Two Modes

### AI-Powered Mode
- Uses OpenAI GPT-3.5-turbo
- Analyzes text for capability matching
- More accurate and nuanced
- Requires OPENAI_API_KEY

### Rule-Based Mode
- Uses keyword matching
- Works without API key
- Still provides value
- Automatic fallback

## Requirements

### To Use AI Scoring

1. **Create Company Profile**
   - Required for any scoring
   - Must include NAICS codes
   - Certifications optional but recommended

2. **Add Capabilities (Optional)**
   - Describe what your company does
   - List key services and experience
   - More detail = better matching

3. **Configure OpenAI (Optional)**
   - For AI-powered mode
   - Rule-based works without it

## Tips

- **Trust the Score**: It's based on objective matching
- **Review 70+**: These are your best bets
- **Don't Ignore Context**: Score isn't everything
- **Update Profile**: Keep it current for best results`,
  },
  {
    id: 'improving-scores',
    title: 'Improving Your AI Scores',
    category: 'ai-scoring',
    keywords: ['improve', 'optimize', 'better-scores', 'profile'],
    order: 2,
    content: `# Improving Your AI Scores

Get better scores by optimizing your company profile.

## 1. Add All Relevant NAICS Codes

The more NAICS codes you have, the more opportunities will match:

- Add primary NAICS code
- Add all secondary NAICS codes
- Include adjacent industries
- Don't add codes you can't support

## 2. Complete Certifications

Add all certifications you hold:

- 8(a) Business Development
- HUBZone
- Service-Disabled Veteran-Owned (SDVOSB)
- Woman-Owned Small Business (WOSB)
- Veteran-Owned Small Business (VOSB)
- Any state or local certifications

## 3. Write Detailed Capabilities

The AI uses your capabilities description:

**Do:**
- Be specific about services offered
- Mention technologies and tools
- Include industries served
- List types of projects completed

**Don't:**
- Write vague descriptions
- Use only buzzwords
- Exaggerate capabilities
- Leave it blank

**Example:**

❌ Bad: "We provide IT services"

✅ Good: "We provide custom software development (Java, Python, React), cloud infrastructure management (AWS, Azure), cybersecurity assessments, and 24/7 IT support for federal agencies. Experience includes FISMA compliance, FedRAMP authorization, and DHS projects."

## 4. Add Past Performance

Include relevant project examples:

- Project name and customer
- Brief description
- Contract value
- Dates
- Technologies used

## 5. Keep Profile Updated

- Review quarterly
- Add new certifications
- Update capabilities as you grow
- Add new NAICS codes when diversifying

## 6. Verify Information

Double-check that:
- NAICS codes match your SAM.gov registration
- Certifications are current (not expired)
- Contact information is accurate
- Capabilities reflect current abilities`,
  },

  // Government Contracting
  {
    id: 'contracting-basics',
    title: 'Government Contracting Basics',
    category: 'contracting',
    keywords: ['basics', 'introduction', 'federal', 'contracting'],
    order: 1,
    content: `# Government Contracting Basics

Learn the fundamentals of winning federal contracts.

## What is SAM.gov?

SAM.gov (System for Award Management) is the official U.S. government system for:
- Entity registration
- Contract opportunities
- Federal award data
- Exclusion records

## Types of Contract Opportunities

### Presolicitation
- **What**: Advance notice of upcoming opportunity
- **Action**: Prepare, but can't respond yet
- **Timing**: Usually 15-30 days before solicitation

### Combined Synopsis/Solicitation
- **What**: Full solicitation ready for response
- **Action**: Can respond immediately
- **Timing**: Response deadline specified

### Solicitation
- **What**: Formal request for proposals (RFP/RFQ)
- **Action**: Submit proposal by deadline
- **Timing**: Usually 30-60 days to respond

### Sources Sought / RFI
- **What**: Market research, not a solicitation
- **Action**: Can express interest
- **Timing**: Not a contract award

### Special Notice
- **What**: General announcements
- **Action**: Read for information
- **Timing**: Various

## Contract Types

### Firm-Fixed-Price (FFP)
- Fixed price regardless of costs
- Best for: Well-defined work
- Risk: Contractor bears cost risk

### Time-and-Materials (T&M)
- Paid hourly/daily rate plus materials
- Best for: Undefined scope
- Risk: Government bears cost risk

### Cost-Plus
- Costs reimbursed plus fee
- Best for: Research, complex work
- Risk: Government bears most risk

## Small Business Set-Asides

### 8(a) Business Development
- For socially/economically disadvantaged businesses
- 9-year program with SBA
- Sole-source up to $4M/$7M

### HUBZone
- For businesses in historically underutilized zones
- 3% government-wide goal

### SDVOSB
- Service-Disabled Veteran-Owned Small Business
- 3% government-wide goal
- Growing preference

### WOSB
- Woman-Owned Small Business
- 5% government-wide goal

## How to Win Contracts

### 1. Get Registered
- SAM.gov entity registration (required)
- Obtain UEI number
- Register correct NAICS codes

### 2. Get Certified
- Pursue relevant certifications
- Verify with SBA or certifying body
- Keep certifications current

### 3. Start Small
- Target contracts under $250K initially
- Build past performance
- Establish track record

### 4. Build Relationships
- Attend industry days
- Meet contracting officers
- Join industry associations

### 5. Write Great Proposals
- Follow instructions exactly
- Address all requirements
- Show past performance
- Price competitively

## Resources

- **SAM.gov**: sam.gov
- **SBA**: sba.gov
- **GSA Schedules**: gsa.gov/schedules
- **Forecast**: sam.gov/opportunities (Forecasted tab)`,
  },
  {
    id: 'response-strategies',
    title: 'Response and Proposal Strategies',
    category: 'contracting',
    keywords: ['proposal', 'response', 'strategy', 'win'],
    order: 2,
    content: `# Response and Proposal Strategies

Learn how to craft winning proposals for federal opportunities.

## Before You Respond

### Qualify the Opportunity

Ask yourself:
- ✅ Do I meet minimum qualifications?
- ✅ Can I fulfill all requirements?
- ✅ Do I have relevant past performance?
- ✅ Is the price range feasible?
- ✅ Can I meet the deadline?
- ❌ If any answer is "no," reconsider

### Read Everything

- **Solicitation**: Read word-for-word
- **Statement of Work**: Understand all tasks
- **Evaluation Criteria**: Know how you'll be judged
- **Requirements**: Check every checkbox
- **Amendments**: Watch for updates

### Understand Evaluation

Most common evaluation factors:
1. **Technical Approach** (usually highest weight)
2. **Past Performance** (often second)
3. **Price** (important but rarely highest)
4. **Key Personnel** (for service contracts)

## Writing the Proposal

### Follow Instructions EXACTLY

- Use specified format
- Answer all questions
- Include all required sections
- Follow page limits
- Use required fonts/formatting

### Use a Compliance Matrix

Create a checklist:
- [ ] Requirement 1 - Addressed on page X
- [ ] Requirement 2 - Addressed on page Y
- Ensure 100% coverage

### Structure Your Response

**Executive Summary**
- Brief overview
- Why you're the best choice
- Key discriminators

**Technical Approach**
- Methodology for each task
- Show understanding
- Describe deliverables
- Include graphics/charts

**Past Performance**
- Relevant projects
- Similar scope/size
- Positive outcomes
- Client references

**Key Personnel**
- Resumes for key staff
- Relevant experience
- Credentials/certifications
- Commitment to project

**Price**
- Competitive but realistic
- Detailed cost breakdown
- Justify costs
- Show value

### Writing Tips

**Do:**
- Use clear, concise language
- Focus on benefits
- Show, don't just tell
- Use specific examples
- Include metrics and data
- Proofread multiple times

**Don't:**
- Use jargon without explanation
- Make unsupported claims
- Copy/paste from old proposals
- Ignore evaluation criteria
- Submit late

## Common Mistakes to Avoid

### 1. Non-Responsive Proposal
- Fails to address requirements
- **Result**: Eliminated immediately

### 2. Incomplete Submission
- Missing required documents
- **Result**: Disqualified

### 3. Late Submission
- Even 1 minute late is too late
- **Result**: Not considered

### 4. Price Errors
- Math mistakes, unrealistic pricing
- **Result**: Eliminated or loss of profit

### 5. Weak Past Performance
- Irrelevant examples, no references
- **Result**: Low score

## Bid/No-Bid Decision

### Bid If:
- ✅ High win probability (P-Win > 40%)
- ✅ Strategic importance
- ✅ Have necessary resources
- ✅ Can be competitive on price
- ✅ Want this client/work

### No-Bid If:
- ❌ Low win probability
- ❌ Can't meet requirements
- ❌ Not strategic
- ❌ Cost of proposal too high
- ❌ Better opportunities available

## After Submission

### If You Win
- Celebrate briefly
- Start contract quickly
- Deliver excellence
- Build relationship
- Pursue follow-on work

### If You Lose
- Request debriefing
- Learn from feedback
- Improve for next time
- Stay in touch with agency
- Try again

## Resources

- **Proposal templates**: Available from PTAC
- **Training**: SBA offers free classes
- **Consultants**: Consider for large bids
- **Team members**: Partner with experienced firms`,
  },

  // Troubleshooting
  {
    id: 'common-issues',
    title: 'Common Issues and Solutions',
    category: 'troubleshooting',
    keywords: ['troubleshooting', 'problems', 'issues', 'errors', 'help'],
    order: 1,
    content: `# Common Issues and Solutions

Quick solutions to frequently encountered problems.

## Search Issues

### Problem: No Results Found

**Possible Causes:**
- NAICS code has no active opportunities
- Date range too narrow
- SAM.gov API issues

**Solutions:**
1. Try different NAICS codes
2. Expand date range
3. Check SAM.gov directly
4. Try again later

### Problem: Search is Slow

**Possible Causes:**
- SAM.gov API rate limiting
- Large date range
- Network issues

**Solutions:**
1. Narrow date range
2. Wait a moment between searches
3. Check internet connection

## Notification Issues

### Problem: Not Receiving Emails

**Possible Causes:**
- Email not configured
- Subscription not active
- Wrong email address
- Emails in spam folder

**Solutions:**
1. Verify email in subscription settings
2. Check subscription is marked "active"
3. Look in spam/junk folder
4. Add sender to safe senders list
5. Check email server isn't blocking

### Problem: Too Many Emails

**Possible Causes:**
- Multiple overlapping subscriptions
- Frequency set to "daily"

**Solutions:**
1. Review all subscriptions
2. Remove duplicates
3. Change frequency to "weekly"
4. Consolidate NAICS codes

## AI Scoring Issues

### Problem: No AI Scores Showing

**Possible Causes:**
- No company profile created
- OpenAI API key not configured

**Solutions:**
1. Create company profile (required)
2. Add NAICS codes to profile
3. For AI mode: Configure OPENAI_API_KEY
4. Rule-based scoring works without API key

### Problem: Scores Seem Wrong

**Possible Causes:**
- Incomplete company profile
- Outdated NAICS codes
- Missing certifications

**Solutions:**
1. Review company profile
2. Add all relevant NAICS codes
3. Add certifications
4. Update capabilities description

## Saved Opportunities Issues

### Problem: Can't Save Opportunity

**Possible Causes:**
- Database connection issue
- Opportunity already saved

**Solutions:**
1. Refresh page and try again
2. Check "Saved" list for duplicates
3. Clear browser cache

### Problem: Saved Opportunities Disappeared

**Possible Causes:**
- Accidentally deleted
- Browser issue
- Database issue

**Solutions:**
1. Refresh the page
2. Search for the opportunity again
3. Contact support if persistent

## Export Issues

### Problem: Export Not Working

**Possible Causes:**
- No opportunities selected
- Browser blocking download
- Server error

**Solutions:**
1. Select at least one opportunity
2. Check browser download settings
3. Try different format
4. Try different browser

### Problem: Export File Won't Open

**Possible Causes:**
- Missing required software
- Corrupted download
- Wrong file association

**Solutions:**
1. Install appropriate software (Excel, PDF reader)
2. Re-download the file
3. Try different format

## Login/Access Issues

### Problem: Can't Access Application

**Possible Causes:**
- Network issues
- Server maintenance
- Browser issues

**Solutions:**
1. Check internet connection
2. Try different browser
3. Clear browser cache and cookies
4. Try again later

## Still Having Issues?

If these solutions don't help:

1. **Use the Chatbot**: Ask our AI assistant for help
2. **Check Status**: Look for system announcements
3. **Contact Support**: Reach out to technical support
4. **Documentation**: Review relevant help articles

## Reporting Bugs

When reporting issues, include:
- What you were trying to do
- What happened instead
- Error messages (if any)
- Browser and version
- Screenshots (if applicable)`,
  },
];

export class DocumentationService {
  /**
   * Get all documentation categories
   */
  static getCategories(): DocCategory[] {
    return DOC_CATEGORIES;
  }

  /**
   * Get all articles in a category
   */
  static getArticlesByCategory(categoryId: string): DocArticle[] {
    return DOC_ARTICLES
      .filter((article) => article.category === categoryId)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get a specific article by ID
   */
  static getArticle(articleId: string): DocArticle | null {
    return DOC_ARTICLES.find((article) => article.id === articleId) || null;
  }

  /**
   * Search documentation
   */
  static search(query: string): DocArticle[] {
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
      return [];
    }

    return DOC_ARTICLES
      .map((article) => {
        let score = 0;

        // Title match (highest weight)
        if (article.title.toLowerCase().includes(lowerQuery)) {
          score += 10;
        }

        // Keywords match
        if (article.keywords.some((kw) => kw.includes(lowerQuery))) {
          score += 5;
        }

        // Content match
        if (article.content.toLowerCase().includes(lowerQuery)) {
          score += 2;
        }

        return { article, score };
      })
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((result) => result.article)
      .slice(0, 10); // Return top 10 results
  }

  /**
   * Get all articles (for export/backup)
   */
  static getAllArticles(): DocArticle[] {
    return DOC_ARTICLES;
  }

  /**
   * Get related articles based on category
   */
  static getRelatedArticles(articleId: string, limit: number = 3): DocArticle[] {
    const article = this.getArticle(articleId);
    if (!article) {
      return [];
    }

    return this.getArticlesByCategory(article.category)
      .filter((a) => a.id !== articleId)
      .slice(0, limit);
  }
}
