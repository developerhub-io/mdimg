# mdimg

A CLI tool to download images that are referenced in Markdown files in a path.

How does it work:
1. Path to a folder is provided to the CLI tool
2. `.md` files are scanned recursively inside the folder and all sub directories.
3. Markdown image URL notations are scanned and images URLs are extracted.
4. Images are downloaded to a folder named `downloaded_images`.

## Usage

```
mdimg <path-to-folder>
```

The images will be downloaded to a folder named `downloaded_images` at current working directory.

## Building

To build into executables, use `npm run build`.