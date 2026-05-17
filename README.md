# Threads Scraper

A Tampermonkey userscript that scrapes all posts from any public Threads profile — from their first post to the latest. Zero setup, runs directly in your browser.

## Features

- **Full history** — scrapes every post from day one to present
- **Text, images, videos** — captures post content, media URLs, timestamps, and like counts
- **Replies tab** — optionally scrapes the user's replies too
- **Deep mode** — opens each post individually to capture conversations where the creator replied
- **Export JSON, CSV & Markdown** — download structured data in your preferred format
- **No login required** — works on any public profile
- **Ad blocker safe** — no network interception, reads directly from rendered DOM
- **Modern UI** — minimal dark panel with Lucide icons, inspired by shadcn/ui

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Open Tampermonkey Dashboard → Create new script
3. Paste the contents of [`threads_scraper.user.js`](./threads_scraper.user.js)
4. Save (Ctrl+S / Cmd+S)

## Usage

1. Navigate to any Threads profile: `https://www.threads.com/@username`
2. The scraper panel appears in the top-right corner
3. Configure options (scroll delay, replies tab, deep mode)
4. Click **Start Scraping**
5. Wait until it finishes (auto-stops when no new posts found)
6. Click **JSON**, **CSV**, or **Markdown** to download

## Options

| Setting | Description |
|---------|-------------|
| Scroll delay | Milliseconds between each scroll step (default: 1800) |
| Include replies tab | Toggle to also scrape the Replies tab |
| Deep mode | Opens each post to capture conversations where the creator replied |

## Modes

### Fast mode (default)

Scrapes posts and replies tab from the profile page. Quick but doesn't capture comments from other users inside each post.

### Deep mode

After scraping the profile, opens each post URL one by one and extracts conversations. Only keeps comment threads where the **creator actually replied** — ignores unresponded comments.

## Output formats

### JSON

```json
{
  "username": "zuck",
  "total": 150,
  "total_with_text": 142,
  "total_conversations": 45,
  "posts": [
    {
      "code": "ABC123",
      "text": "Post content here...",
      "time": "2024-07-06T10:30:00.000Z",
      "like_count": 5000,
      "images": ["https://..."],
      "has_video": false,
      "url": "https://www.threads.com/@zuck/post/ABC123",
      "conversations": [
        {
          "user_comment": {
            "text": "great post!",
            "username": "fan123",
            "time": 1720000000
          },
          "creator_reply": {
            "text": "thanks!",
            "username": "zuck",
            "time": 1720000100
          }
        }
      ]
    }
  ]
}
```

### CSV

Flat format with columns: `code`, `username`, `text`, `time`, `like_count`, `has_video`, `images`, `url`

### Markdown

Human-readable archive format with headers, blockquotes for conversations, and links. Works great in Notion, Obsidian, or any markdown viewer.

## How it works

Threads virtualizes its DOM — only posts visible in the viewport have their content rendered. The scraper handles this by:

1. Scrolling in small increments (60% viewport) to keep posts visible longer
2. Extracting text from `span[dir="auto"]` / `div[dir="auto"]` elements on each scroll
3. Merging data across scroll passes — if a post was seen without text earlier, it gets updated when text becomes available
4. Deep mode fetches each post's HTML page and parses hidden JSON `<script>` tags for comment data
5. Detecting end-of-feed after 12 consecutive scrolls with no new posts

## Limitations

- **Private accounts** cannot be scraped
- **Text capture rate** depends on scroll speed — slower = more text captured
- **Deep mode is slow** — 1 request per post, so 200 posts ≈ 5-10 minutes
- **Like counts** may show 0 if Threads doesn't expose them in aria-labels
- Only works on profile pages (`/@username`), not the home feed

## Tech

- Vanilla JavaScript (no dependencies)
- Lucide icons
- DOM parsing + hidden JSON extraction
- Tampermonkey userscript API

## License

[MIT](./LICENSE)
