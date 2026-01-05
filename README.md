# Portfolio Website

A modern, responsive portfolio website built with HTML, CSS, and JavaScript. Features a clean design with smooth animations and a mobile-friendly interface.

## Features

- 🎨 **Modern Design** - Clean, professional layout with gradient accents
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- ✨ **Smooth Animations** - Engaging transitions and scroll effects
- 🚀 **Fast Performance** - Lightweight and optimized for speed
- ♿ **Accessible** - Semantic HTML and ARIA labels for better accessibility
- 🎯 **SEO Friendly** - Proper meta tags and semantic structure

## Sections

1. **Hero Section** - Eye-catching introduction with call-to-action buttons
2. **About** - Personal information and statistics
3. **Skills** - Technical skills organized by category
4. **Projects** - Showcase of featured projects with links
5. **Contact** - Contact form and social media links

## Getting Started

### Prerequisites

No special prerequisites needed! Just a modern web browser.

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser
3. That's it! No build process required.

### Local Development

For a better development experience, you can use a local server:

**Using Python:**
```bash
python -m http.server 8000
```

**Using Node.js (with http-server):**
```bash
npx http-server
```

**Using VS Code:**
- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

Then open `http://localhost:8000` (or the port shown) in your browser.

## Customization

### Personal Information

1. **Name and Title** - Edit the hero section in `index.html`:
   ```html
   <span class="name">Your Name</span>
   <p class="hero-subtitle">Your Title</p>
   ```

2. **About Section** - Update the about text in `index.html`

3. **Contact Information** - Update email, phone, and location in the contact section

4. **Social Links** - Update the social media links in the contact section footer

### Skills

Edit the skills in `index.html` under the skills section. Add or remove skill tags as needed.

### Projects

Add your projects in the projects section:
- Update project titles and descriptions
- Add project images (replace the SVG placeholders)
- Update technology tags
- Add your project links (GitHub, live demo, etc.)

### Colors

Customize the color scheme in `styles.css` by modifying the CSS variables:
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --accent-color: #ec4899;
    /* ... more variables */
}
```

### Images

Replace the placeholder SVGs with your own images:
- Profile picture in the hero section
- Project screenshots in the projects section

## File Structure

```
Portfolio Website/
│
├── index.html          # Main HTML file
├── styles.css          # All styles and animations
├── script.js           # JavaScript for interactivity
└── README.md           # This file
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the MIT License.

## Credits

- Fonts: [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)
- Icons: Custom SVG icons

## Future Enhancements

Potential features to add:
- Dark mode toggle
- Blog section
- Testimonials section
- More interactive animations
- Backend integration for contact form
- Multi-language support

---

Made with ❤️ for showcasing your work

