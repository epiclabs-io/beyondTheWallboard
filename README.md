# Beyond the wallboard
Chrome extension to create a slideshow with several preconfigured tabs.

# Configuration example

The configuration of the tabs to be opened is loaded as a JSON file from the extension configuration page.

There are two main properties to be defined:

1. ```general``` will define general options to be applied to all the tabs defined:

    * ```timeInterval``` {number} Defines the time, in seconds, to rotate the tabs.

    * ```refreshWhenLeave``` {boolean} Refresh the tabs after leave it (when rotation is done).

2. ```tabs``` will contain an array defining each one of the tabs to be opened along with options related to that specifical tab:

    * ```url``` {string} The URL to be loaded.

    * ```timeInterval``` {number} Defines the time, in seconds, to rotate this particular tab. This overrides the ```timeInterval``` defined in ```general```.

    * ```postitTitle``` {Object} Allows to place the title of the page or a custom title as a post-it, usefull when the browser is in fullscreen and you cannot see the title of the page. If this is not provided, the post-it will not be placed. Available properties are:

        * ```width``` {string} Defines the width of the post-it as in CSS. If this is not provided, will be automatically adjusted.

        * ```color``` {string} The color of the text on the post-it as in CSS. If this is not provided, color ```white``` will be used.

        * ```top``` {string} The distance of the post-it to the top of the page as in CSS. If this is not provided, ```10px``` will be used.

        * ```left``` {string} The distance of the post-it to the left of the page as in CSS. If this is not provied, ```10px``` will be used.

        * ```border``` {string} Definition of the border of the post-it as in CSS. If this is not provided, ```3px solid #73AD21``` will be used.

        * ```background``` {string} Definition of the background of the post-it as in CSS. If this is not provided ```rgba(0, 0, 0, .8)``` will be used.

        * ```customTitle``` {string} Definition of a custom title. If this is not provided, the default title of the page will be used.

Please, refer to the example below:

```json
{
    "general": {
        "timeInterval": 10,
        "refreshWhenLeave": true
    },
    "tabs": [
        {
            "url": "https://xkcd.com/",
            "timeInterval": 3
        }, {
            "url": "http://epiclabs.io/",
            "refreshWhenLeave": true,
            "postitTitle": {
                "width": "600px",
                "color": "black",
                "top": "10px",
                "left": "10px",
                "border": "1px solid black",
                "background": "green",
                "customTitle": "Epic Labs"
            }
        }, {
            "url": "https://stackoverflow.com/",
            "refreshWhenLeave": true,
            "postitTitle": {
                "width": "600px",
                "color": "black",
                "top": "10px",
                "left": "10px",
                "border": "1px solid black",
                "background": "green"
            }
        }
    ]
}
```

## History

- 2010/01/30 - Initial working alpha version -Ben
- 2010/10/26 - Work with multiple windows -Fred
- 2010/10/27 - Don't change tabs if the browser isn't idle -Fred
- 2011/04/15 - Made "inactive" mode optional, added notification of "wait". Fixed timing bug. -Ben
- 2011/04/15 - Added more debugging, fixed user notification for "running" vs. "off". -Ben
- 2013/03/21 - Moved the page reload to happen before tab switching to avoid flashing when tab switches and made it compatible with manifest_version 2. - Aurimas
- 2013/04/04 - Added much requested autostart feature and cleaned up look and function of Options page. -Ben
- 2017/11/17 - Changed reload functionality: now selected tabs for reload actually reload after rotate. -Lucas
- 2017/11/17 - Reallocating resource files and updating the options view. -Adrian
- 2017/11/17 - Added floating title to every tab. -Lucas
- 2018/01/26 - Extending JSON config file and storing it inside window object. -Adrian
- 2018/01/26 - Added style to Title. Loaded configuration from JSON. -Lucas
- 2018/04/05 - Code cleanup. -Adrian
- 2018/04/05 - Don't show customTitle when it is not configured. -Lucas
- 2018/04/05 - Removing error from options page. -Adrian
- 2018/04/05 - Loading the configuration from a JSON file. -Adrian
- 2018/04/05 - Bugfixing. -Lucas
- 2018/04/05 - Using the configuration loaded into local storage. -Adrian
- 2018/04/05 - Solved bug when manually added new tab after init. -Adrian
- 2018/04/05 - Fixed refreshWhenLeave issue. -Lucas
- 2018/04/06 - Removed unused functions. -Lucas
- 2018/04/06 - New feature: stop rotating when interacting. -Lucas
- 2018/04/06 - Fixed check undefined variable. -Lucas
- 2018/04/06 - Removed autostart from configuration file and updated README. -Adrian

## Authors

- Created by Ben Hedrington
- Improved by Fred Emmott
- Improved again by Ben Hedrington
- Improved yet again by Aurimas Liutikas
- Improved yet again by Ben Hedrington
- Refactored and improved by Lucas Bernalte & Adrian Caballero

## Sources
Originally based on [chrome-revolver-plugin by Foliotek](https://github.com/Foliotek/chrome-revolver-plugin) which is based on [revolver-chrome-extensions by Ben Hedrington](https://code.google.com/archive/p/revolver-chrome-extensions/).
