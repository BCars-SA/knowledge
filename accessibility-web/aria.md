# ARIA (Accessible Rich Internet Applications)

ARIA is a set of attributes that define ways to make web content and web applications more accessible to people with disabilities. Here are some common best practices and recommendations for using ARIA attributes:

## Best Practices
- Use native HTML elements where possible, as they have built-in accessibility features.
- Only use ARIA attributes when necessary.
- Ensure that ARIA attributes are used correctly and according to their specifications.
- Test your application with screen readers and other assistive technologies.

## Recommendations for ARIA Attributes

### Header
- [`<header>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/header) element is used for the header of a section or page.
- [`role="banner"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Banner_role): Identifies the site-wide header, which usually includes a logo, company name, search feature, and possibly the global navigation or a slogan.
- [`role="heading"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/heading_role): Identifies a heading element.

### Footer
- [`<footer>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/footer) element is used for the footer of a section or page.
- [`role="contentinfo"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/contentinfo_role): Identifies the site-wide footer.

### Other landmarks
- [`<aside>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/aside) or [`role="complementary"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Complementary_role): Identifies a supporting section of the document, designed to be complementary to the main content. [Learn more](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Complementary_role)
- [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form) or [`role="form"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Form_role): Identifies a region that contains a collection of form-associated elements. [Learn more](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Form_role)
- [`<main>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/main) or [`role="main"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Main_role): Identifies the main content of the document. [Learn more](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Main_role)
- [`<nav>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav) or [`role="navigation"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Navigation_role): Identifies a section of the document intended for navigation. [Learn more](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Navigation_role)
- [`<section>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section) or [`role="region"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Region_role): Identifies a significant section of the document. [Learn more](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Region_role)
- [`<search>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/search) or [`role="search"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Search_role): Identifies a section of the document intended for searching. [Learn more](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Search_role)

### Button
- use [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button) native element instead of `<div role="button" />`
- [`aria-pressed`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed): Indicates the current "pressed" state of a toggle button.
- [`aria-disabled`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-disabled): Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.    
- [`aria-expanded`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded): Indicates whether a button controls the display of additional content.
- [`aria-controls`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-controls): Identifies the element (or elements) that the button controls. This is useful when a button opens or controls another section of the page.
    ```html
    <button aria-controls="details-section" id="details-button" aria-expanded="true" aria-pressed="true">Show Details</button>
    <div id="details-section" aria-labelledby="details-button" aria-hidden="false">
        <!-- Details content here -->
    </div>
    ```

### Inputs
- [`aria-labelledby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby): Associates a label with an element    
- [`aria-required`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-required): Indicates that user input is required.
- [`aria-describedby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby): Provides a description for an element.
    ```html
    <label id="email-label">Email</label>
    <input type="text" aria-required="true" aria-labelledby="email-label" aria-describedby="email-description" />
    <span id="email-description">Please enter your email address.</span>
    ```

### Validation
- [`aria-invalid`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-invalid): Indicates the entered value does not conform to the expected format.
- [`aria-errormessage`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-errormessage): Provides an error message for the user.
    ```html
    <input type="text" aria-invalid="true" aria-errormessage="email-error" />
    <span id="email-error" role="alert">Please enter a valid email address.</span>
    ```

### Loading Indicators
- [`role="status"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/status_role): Identifies a region that contains dynamic content, such as a loading indicator.
- [`aria-busy="true|false"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-busy): Indicates that an element is in a loading state.
- [`aria-label="loading"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label): Provides an accessible name for an element.
- [`aria-live="polite"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-live): Ensures that updates are announced at the next available opportunity.

### Progress Bar
- [`role="progressbar"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/progressbar_role): Identifies an element as a progress bar.
- [`aria-valuenow`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-valuenow): Defines the current value.
- [`aria-valuemin`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-valuemin): Defines the minimum value.
- [`aria-valuemax`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-valuemax): Defines the maximum value.

### Accordions
- use [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button) to control the accordion
- [`role=region`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Region_role): Identifies a region of the page.
    ```html
    <button aria-controls="section1" id="button1" aria-expanded="false">Section 1</button>
    <div role="region" id="section1" aria-labelledby="button1" aria-hidden="false">
        <!-- Section 1 content here -->
    </div>
    ```

### Tabs
- [`role="tablist"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tablist_role): Identifies a list of tabs.
- [`role="tab"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role): Identifies a tab.
- [`role="tabpanel"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tabpanel_role): Identifies the content panel associated with a tab.
- [`aria-selected`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-selected): Indicates the currently selected tab.

### Images
- [`aria-label`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label): Provides an accessible name for the image.


## Tools and Libraries for Accessibility Testing

### Automatic testing tools

- [Axe](https://www.deque.com/axe/): A comprehensive accessibility testing tool.

- [Pa11y](https://pa11y.org/): A set of tools for automated accessibility testing of web pages.

- [Lighthouse](https://developers.google.com/web/tools/lighthouse): An open-source, automated tool for improving the quality of web pages, including accessibility.

### Screen Readers
- [ChromeVox](https://chrome.google.com/webstore/detail/chromevox-classic-extensio/kgejglhpjiefppelpmljglcjbhoiplfn): A screen reader for Chrome OS and Chrome browser.

## Further Reading
- [WAI-ARIA Overview](https://www.w3.org/WAI/standards-guidelines/aria/)
- [Using ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices/)