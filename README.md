# Threads Scraper

A Tampermonkey userscript that scrapes all posts from any public Threads profile — from their first post to the latest. Zero setup, runs directly in your browser.

## Features

- **Full history** — scrapes every post from day one to present
- **Text, images, videos** — captures post content, media URLs, timestamps, and like counts
- **Replies tab** — optionally scrapes the user's replies too
- **Export JSON & CSV** — download structured data instantly
- **No login required** — works on any public profile
- **Ad blocker safe** — no network interception, reads directly from rendered DOM
- **Modern UI** — minimal dark panel inspired by shadcn/ui

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Open Tampermonkey Dashboard → Create new script
3. Paste the contents of [`threads_scraper.user.js`](./threads_scraper.user.js)
4. Save (Ctrl+S / Cmd+S)

## Usage

1. Navigate to any Threads profile: `https://www.threads.com/@username`
2. The scraper panel appears in the top-right corner
3. Click **Start Scraping**
4. Wait until it finishes (auto-stops when no new posts found)
5. Click **Download JSON** or **Download CSV**

## Options

| Setting | Description |
|---------|-------------|
| Scroll delay | Milliseconds between each scroll step (default: 1800) |
| Include replies | Toggle to also scrape the Replies tab |

## Output

### JSON

```json
{
  "username": "zuck",
  "url": "https://www.threads.com/@zuck",
  "total": 150,
  "total_with_text": 142,
  "scraped_at": "2025-05-17T12:00:00.000Z",
  "posts": [
    {
      "code": "ABC123",
      "text": "Post content here...",
      "username": "zuck",
      "time": "2024-07-06T10:30:00.000Z",
      "like_count": 5000,
      "images": ["https://..."],
      "has_video": false,
      "url": "https://www.threads.com/@zuck/post/ABC123"
    }
  ]
}
```

### CSV

Columns: `code`, `username`, `text`, `time`, `like_count`, `has_video`, `images`, `url`

## How It Works

Threads virtualizes its DOM — only posts visible in the viewport have their content rendered. The scraper handles this by:

1. Scrolling in small increments (60% viewport) to keep posts visible longer
2. Extracting text from `span[dir="auto"]` / `div[dir="auto"]` elements on each scroll
3. Merging data across scroll passes — if a post was seen without text earlier, it gets updated when text becomes available
4. Detecting end-of-feed after 12 consecutive scrolls with no new posts

## Limitations

- **Private accounts** cannot be scraped
- **Text capture rate** depends on scroll speed — slower = more text captured
- **Like counts** may show 0 if Threads doesn't expose them in aria-labels for that post
- Only works on profile pages (`/@username`), not the home feed

## License

[MIT](./LICENSE)
