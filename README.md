# Agent700ChromeExtensionWT

Agent700ChromeExtensionWT is a Chrome extension designed to help users easily scrape data from the web and import it into the Agent700 data library. This tool aims to streamline the process of capturing web content and managing it through the Agent700 platform.

## Features

- **Capture and clean text content from web pages**
- **Easily save captured data to the Agent700 library**
- **Utilize any of your agents to interact with the captured data**
- **Simple and intuitive user interface**
- **Secure login and authentication with Agent700**

## Installation

To install the Agent700ChromeExtensionWT, follow these steps:

1. Clone or download this repository to your local machine.

   ```bash
   git clone https://github.com/Agent700ai/Agent700ChromeExtensionWT.git
   ```

2. Open the Chrome browser and navigate to `chrome://extensions/`.

3. Enable "Developer mode" by clicking the toggle switch in the top right corner.

4. Click on "Load unpacked" and select the directory where you cloned/downloaded the extension.

## Usage

1. After installation, click on the Agent700 extension icon in the Chrome toolbar to open the extension.

2. Use the login form to authenticate with your Agent700 account.

3. Navigate to any web page you want to scrape content from.

4. Click the "Capture" button in the extension interface to extract and clean the page content.

5. Save the captured data to the Agent700 library using the "Add to Library" button.

6. Select any of your agents to interact with the captured data, enabling dynamic data processing and insights.

## Contributing

We welcome contributions to the Agent700ChromeExtensionWT project! If you have suggestions for improvements or encounter any issues, feel free to create a pull request or open an issue in this repository.

## Project Structure

Here's a brief overview of the key files and directories in the project:

- **background.js**: This file acts as the service worker for the Chrome extension, managing background tasks such as handling tab activations, window focus changes, and message passing. It also processes requests for scraping and managing active tabs.

- **Capture.css**: Contains the styling for the capture interface of the extension, ensuring a consistent and user-friendly design for capturing and displaying scraped content.

- **Capture.js**: Handles the logic for initializing the capture functionality, managing user interactions, executing content scripts on active tabs, and saving captured data to the Agent700 library.

- **content-script.js**: Injected into web pages to scrape and clean the text content from the DOM, removing scripts and styles for a cleaner extraction.

- **content.js**: Listens for messages to provide information like screen dimensions of the user's device.

- **login.css**: Provides styles for the login interface, including layout, colors, and typography for a cohesive user experience.

- **login.js**: Manages the login process, allowing users to authenticate with their Agent700 credentials and store the session token for future interactions.

- **sidebar.css**: Defines the styles for the sidebar interface, including layout and visual design for navigation and content display within the extension.

- **sidebar.js**: Handles the logic for dynamically loading different pages in the sidebar based on user interactions with the menu.

- **TalkToPage.css**: Provides styling for the Talk to Page feature, ensuring a clean and responsive interface for interacting with agents on captured data.

- **TalkToPage.js**: Initializes and manages the Talk to Page feature, enabling users to use their agents to engage with the captured data.

- **manifest.json**: The configuration file that defines the extension's metadata, permissions, and resources, crucial for extension functionality in the Chrome browser.

- **login.html**: The HTML markup for the login page, providing the structure for user authentication elements.

- **capture.html**: The HTML markup for the capture page, providing the structure for the capturing and saving of we content.

- **sidebar.html**: The HTML markup for the sidebar menu.

- **TalkToPage.html**: The HTML markup for the agents page. Currently this page has an iFrame that referencse the agents library. The plan is to replace this with an agent selector and custom conversation canvas which will move us away from the iFrame. 

- **LICENSE**: Contains the MIT License text, outlining the terms under which the project is distributed.

- **README.md**: This file provides an overview of the project, including installation instructions, usage guidelines, and information about the project's structure and contributions.

- **auth.js**: Contains utility functions for managing authentication states, including checking if a user is logged in by validating the session token against the Agent700 API.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thank you to all contributors and users who have provided feedback and support for this project.

## Contact

For any questions or support, please contact Agent700.ai at [Support@Agent700.ai](mailto:Support@Agent700.ai).
