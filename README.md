# Introduction

The following project is a chat bot for **Google Assistant**, designed to allow the user to line-up virtually. There will be two parties, customer and staff. Supposedly, customer and staff should have two separate apps. However, since this is a proof of concept, the two sides were combined into one. Think of this app as a virtual take-a-number system that you may have used at the the local butcher, passport office, vehicle licensing office, etc. For more information, take a look at this [report]("https://drive.google.com/open?id=1LMN8z4waEcevj58bm68-O8n9nNOXgGUA").

It makes use of various Google technologies (e.g. **Firebase**, **Actions on Google**, **DialogFlow**) and a variety of `npm` packages (a list of which can be found in `functions/package.json`).

In essence, the user communicates through the **Google Assistant**, whose speech/text input is parsed via **DialogFlow**. This parsed input is interpreted as Intents and sent to fulfillment logic that is implemented in **Firebase Cloud Functions** (which are written and deployed from this project). The fulfillment logic considers the intent and composes an appropriate response based on the configuration stored in the **Firebase Realtime Database** and **Firebase Cloud Storage**.

## Functionality

As a customer, I can:

-   Choose which store I am in
-   Check how long the line is
-   Add myself to line
-   Remove myself from line
-   Check where I am in line
-   Change my phone number
-   Receive notification when it is my turn

As a staff, I can:

-   Check how long the line is
-   Add someone to line
-   Remove someone from line
-   Check where someone is in line
-   Remove and notify the first person in line

For presenting purposes, extra functionality was added:

-   You can choose whether you are a staff or a customer
-   Staff can choose and switch stores

## What's next

-   Customize the experience to individual store
    -   Add location selection support
    -   Add expected wait time per person and expiry time
    -   Notify the N-th customer that it’s almost their turn
-   Let the customer know the expected wait time which should be calculated based on the expected wait time per person and the expiry time
-   Check the Issues tab for more details

# Technology Stack

1.  [Actions on Google/Google Assistant](https://developers.google.com/actions/)
1.  [Google Transaction API](https://developers.google.com/actions/transactions/#integrating_with_the_transactions_api)
1.  [Firebase](https://firebase.google.com/docs/)
    -   [Cloud Functions](https://firebase.google.com/docs/functions/)
    -   [Realtime Database](https://firebase.google.com/docs/database/)
1.  [DialogFlow](https://dialogflow.com/docs/getting-started/basics)
1.  [Typescript](https://www.typescriptlang.org/docs/home.html) (transpiled to Javascript for Node.js)
1.  [NodeJS](https://nodejs.org/)
1.  [Typedoc](https://typedoc.org/)

# Project Components and Systems

## Actions on Google

Qwatch is an Actions on Google (AoG) app. This is where we setup the meta data for the app such as logos, trigger words, target audience, supported devices, etc. This is also where one submits their corporate brand for **Brand Verification** to reserve top-level key-word detection in Google Assistant. There is also a simulator in the AoG console to test out simple interactions with the app/bot. The connection between the app and the Natural Language Processor (NLP) is configured via DialogFlow (below).

## DialogFlow - NLP

Parsing the user's speech/text input from Google Assistant and sending the intents to Firebase's Cloud Functions for fulfillment is handled by DialogFlow.

This component of the project can be found by going to the [DialogFlow Console](https://console.dialogflow.com/api-client/#/login) and logging in with a Google account that has access to the project in the AoG app. The set of intents for a project is contained in a DialogFlow agent. There is a backup of the intents in this repository at `dialogFlow/Qwatch.zip` that can be restored to the agent.

DialogFlow sends requests to Firebase Cloud Functions through the use of webhooks. To set this up go to the _Fulfillment_ section of the DialogFlow agent, enable the _Webhook_ section and paste in the Firebase Cloud Function's URL.

You can find this URL by going to the Firebase console page, selecting the respective Firebase project and going to the Functions section. There, you will see a list of functions deployed for the Firebase project and each functions' URL. Also note that you need to set a header value that will be expected by our (Firebase) fulfillment logic: `Header[fulfillmentAccessToken] = <value you set in Firebase>`.

To integrate the DialogFlow agent with the AoG app, go to the _Integration_ section of the DialogFlow agent and click on the `Google Assistant`. Go to `INTEGRATION SETTINGS` to customize the integration.

<!-- For our implementation ensure that `Sign in required` settings are not set because we want to control sign-in restrictions programmatically. -->

For more information about working with DialogFlow, and dealing with key concepts like entities, intents and contexts, please refer to online tutorials and documentation such as
[How to Build an App for Google Assistant](https://www.youtube.com/watch?v=3NIopUsI4ik), an intro video to integrating Google Assistant and DialogFlow by the Google Developers YouTube channel and the [DialogFlow Documentation Intro Page](https://dialogflow.com/docs/getting-started/basics).

## Firebase Platform - Fulfillment, Configuration, Storage

Much of the functionality of the project is handled by the Firebase cloud platform, including image storage (Firebase Cloud Storage), fulfillment webhooks (Firebase Cloud Functions) and the storage of user configuration (Firebase Realtime Database).

Firebase management is typically performed using the [Firebase console](https://console.firebase.google.com/) with a Google Account that has access to the project used by the AoG app. There is also a CLI interface that can be used for deployment, among other things.

An important thing to note about the Firebase Realtime Database is it is a NoSQL database, structured like a JSON tree. It can be manipulated programmatically or manually by going to the Firebase console's _Database_ page. Ensure that the `rules` are configured to restrict access to authenticated users only.

For more information about working with Firebase's components, please start by looking at the left side bar of [Firebase's documentation guide](https://firebase.google.com/docs/guides/). In particular, for information on Firebase Cloud Storage, the [Google Cloud Storage documentation page](https://cloud.google.com/nodejs/docs/reference/storage/1.5.x/).

### Fulfillment Logic

So far, every system (AoG and DialogFlow) in this ecosystem is configuration-based. The fulfillment logic is the software that we need to create to handle non-trivial interactions with the user. This software is written in Typescript and makes up the majority of this repository. This fulfillment logic will be hosted on Firebase Cloud Functions.

Note that to maintain this component, it will be important to have an understanding of the concept of JavaScript _[Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)_ and object oriented programming. When writing code, keep coupling of functionality to a minimum. Much of the remainder of this document applies to the fulfillment logic.

## TypeScript

The codebase is primarily written in TypeScript. TypeScript is a typed superset of JavaScript that provides additional features like optional types, classes, and modules, to JavaScript. It adds static typing support to enable the use of an advanced transpiler (compiles to another language) to be able to perform type analysis on the codebase, which allows for powerful refactoring, error detection, and intellisense code completion. TypeScript supports tools for large-scale JavaScript applications for any browser, for any host, on any OS.

TypeScript transpiles to readable, standards-based JavaScript, allowing the output to be run by normal JavaScript runtimes, like Node.js, and read by normal humans. The language implements features that are available in newer versions of ECMAScript, for example, _async/wait_, as well as some of their own features that are unique to TypeScript. The transpiler will then compile these features to the requested version of JavaScript.

The language is also entirely open source and available on [GitHub](https://github.com/Microsoft/TypeScript). The project also has some really good [documentation](https://www.typescriptlang.org/docs/home.html) going over its various features. For more information about TypeScript, visit their [website](https://www.typescriptlang.org/), and checkout the [TypeScript Playground](https://www.typescriptlang.org/play/index.html).

# Project Setup

## Setting up the build environment

First, install Git and Node.js/npm. You can do this via CLI or going to the following links:

-   [Downloading Git for Windows, Mac or Linux](https://git-scm.com/downloads)
-   [Downloading Node for Windows, Mac or Linux](https://nodejs.org/en/download/)

Afterwards, install firebase-tools via `npm` globally

```bash
npm install -g firebase-tools
```

Lastly, install the code's dependencies locally from within the repository.

```bash
cd functions
npm install
```

After completing the required installations, login to Firebase using the CLI as seen directly below and select the appropriate project. This will allow you to deploy to the Firebase platform (among other things). To see how to deploy, check the [Deploy](#deploying-building) section below.

```bash
firebase login
firebase use <project-alias as defined in .firebaserc>
```

Create a service account on Google Actions API and download the json file. Copy the json and paste it in the [service account](.\functions\src\config\serviceAccount.ts) file. Do **not** commit this file.

<!-- ## Graphical Images

The app displays images for menu items in Cards, Carousels or Lists. Images in the app must be referenced by a publicly accessible URL. We can use Firebase Cloud Storage to store images for this purpose but if there is a better source for images then this section can be ignored in favour of pointing the global configurations (below) directly to the better image source. -->

### Git-LFS

The project makes use of Git-LFS for the storage of binary files, like images, zip files, etc.

To setup LFS, install `git-lfs` following the instructions from the following link: [Git-LFS Wiki - How to Install](https://github.com/git-lfs/git-lfs/wiki/Installation).

After installing `git-lfs` for your Linux system, go to the folder where you cloned the project and run the following line to pull the images from our Git LFS server:

```bash
git lfs pull
```

# Codebase

`functions/src` contains the fulfillment logic. This codebase has various interactions with the other technologies in the project, including:

-   Acting as a webhook once deployed to Firebase Cloud Functions for DialogFlow's intents
-   Retrieving and storing the Firebase Realtime Database to update store situation
-   Constructing and sending responses to Google Assistant

## functions/src/

In `src`, there are a variety of files with different key purposes to the project, including:

### index.ts

Contains the Firebase Cloud Functions definitions, including `dialogflowFirebaseFulfillment` which is the webhook endpoint that DialogFlow will send it's intents to

### dialogFlowHandler.ts

Processes the DialogFlow V2 requests from DialogFlow, passing the requests to the appropriate function in the `actionHandler` folder (This file is only used for DialogFlow V2, so it is not currently in use).

### actionHandlers.ts

Processes the DialogFlow V1 requests from DialogFlow, passing the requests to the appropriate function in the `actionHandler` folder (This file is only used for DialogFlow V1, this is the one currently in use as the Google Transaction API only works with this version).

## functions/src/actionHandlers

Classes which are designed to controlled WHAT responses to give back to the user.

### IActionHandler

The interface for the `baseHandler` class and all the classes that inherit from it. It is key to the project as it controls WHAT to respond to the user with.

### baseHandler

The base class for the other classes in `actionHandlers`

### Remaining files

All extend the `baseHandler` class, for more information on these files, look at their in-line comments

## functions/src/dataSources

Logic for accessing data from remote sources, specifically:

# Generating Documentation

The codebase reference manual can be generated from comments in the code using `typedoc`, an `npm` package which generates documentation for Typescript projects. This package should have been installed locally on the project when you ran `npm install` in the [Project setup section](#project-setup).

Build the reference manual using this command:

```bash
npm run docs
```

The npm script `npm run docs` is defined in `package.json` where you can customize how the documentation is generated, such as the theme that is used and the output location.
