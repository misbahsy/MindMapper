# Mind Mapper

A web application that generates interactive mind maps from URLs, YouTube videos, or text prompts using Langflow APIs.

## Features

- Generate mind maps from URLs, YouTube videos, or text prompts
- Interactive mind map visualization using Mermaid.js
- View detailed information about each node in the mind map
- Download mind maps as PNG images for sharing
- Modern UI built with Next.js and Shadcn UI

## Prerequisites

- Node.js 18.0.0 or later
- Langflow API server running at http://127.0.0.1:7860

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/mindmapper.git
cd mindmapper
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Configuration

The application uses the following Langflow API endpoints:

- URL: http://127.0.0.1:7860/api/v1/run/1e9960df-6b9d-48eb-81c2-26af9e877f50?stream=false
- YouTube: http://127.0.0.1:7860/api/v1/run/13b817f9-1478-4f5a-8775-c6f4de8019e7?stream=false
- Prompt: http://127.0.0.1:7860/api/v1/run/f6081c11-6dc9-4941-8598-f21f97d94e4c?stream=false

Make sure your Langflow server is running and these endpoints are accessible.

## Usage

1. Select the input type (URL, YouTube, or Prompt)
2. Enter your input in the text field
3. Click "Generate Mind Map"
4. Explore the generated mind map by clicking on nodes to view details
5. Download the mind map as a PNG image using the Download button

## Technologies Used

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Mermaid.js](https://mermaid-js.github.io/mermaid/)
- [html-to-image](https://github.com/bubkoo/html-to-image)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
