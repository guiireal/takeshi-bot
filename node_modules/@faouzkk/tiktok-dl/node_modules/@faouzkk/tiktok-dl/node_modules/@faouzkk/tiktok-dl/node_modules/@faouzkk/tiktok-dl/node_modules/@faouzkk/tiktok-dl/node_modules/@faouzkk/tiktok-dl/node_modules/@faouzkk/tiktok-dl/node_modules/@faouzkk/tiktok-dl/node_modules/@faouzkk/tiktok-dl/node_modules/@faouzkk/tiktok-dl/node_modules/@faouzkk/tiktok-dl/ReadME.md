# TikTok Video Downloader by URL

A simple and efficient Node.js module for downloading TikTok videos using their URLs. This module allows you to quickly fetch and save TikTok videos to your local machine without any watermarks.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Output](#output)
- [Contributing](#contributing)
- [License](#license)

## Features

- Download TikTok videos by URL
- Supports downloading videos without watermarks
- Easy to use and integrate into your projects

## Installation

To install the module, run the following command:

```bash
npm install @faouzkk/tiktok-dl
```

## Usage

Here’s a quick example of how to use the module:

```js
const tiktokdl = require('@faouzkk/tiktok-dl');

(async () => {
    const tiktok = await tiktokdl('https://www.tiktok.com/@.tobi.uchiha_/video/7317012349897002245?is_from_webapp=1&sender_device=pc&web_id=7408654694422414854');
    console.log(tiktok);
})();
```

## API

### `tiktokdl(url: string): Promise<VideoResponse>`

- **Parameters:**
  - `url` (string): The URL of the TikTok video you want to download.
  
- **Returns:**
  - A Promise that resolves with a response object containing the video details.

## Output

The output from the `tiktokdl` function will be an object in the following format:

```json
{
  "status": 200,
  "author": "FaouzKK",
  "video": "https://tikcdn.io/ssstik/7317012349897002245",
  "audio": "https://tikcdn.io/ssstik/aHR0cHM6Ly9zZjE2LWllcy1tdXNpYy12YS50aWt0b2tjZG4uY29tL29iai9tdXNpY2FsbHktbWFsaXZhLW9iai83MzE3MDEyNDI1MDQwMjAyNTAyLm1wMw=="
}
```

## Contributing

Contributions are welcome! If you have suggestions for improvements or features, feel free to open an issue or submit a pull request.

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## License

This project is licensed under the ISC License.
