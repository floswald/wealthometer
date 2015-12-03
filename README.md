

# Source code for [wealthometer.org](http://wealthometer.org)

[wealthometer.org](http://wealthometer.org) is a website that calculates the user's position in the wealth distribution of their country, and performs simulations of tax reforms.

## Contributing

We are looking for contributors to enlarge the set of countries that we cover. We have data for many more countries, but lack the language skills to translate the text into the corresponding languages. If you would like to contribute it's easy:

1. Fork this repo onto your github account.
1. Clone your fork to your computer.
1. Copy the country folder that you want to use as your template and rename it to your country, following a two letter naming convention, if possible.
	1. Do not change any of the filenames and links, i.e just edit *visible text*.
	1. There are some changes to be made in the `javascript` code, but we will guide you through that after you've done the text.
	1. If your country is in the Eurozone, and you can work off any of the existing languages (not English), you should use one of those. They have the € signs, as well as the numerical formatting is Europe-specific. For example, if you are from France but know German, you could copy the Germany folder.
	1. Alternatively copy the US folder. We will deal with numerical formatting.
	1. Commit your changes locally.
	1. Push to github.
1. Once you are done with the text, submit a pull request on this repository.
1. We will look at the things you did and fill in the small bits and pieces referred to above

## Contact

For all kinds of questions, please file and issue on this repository.

## Attribution

Your work will be acknowledged in the `credits` section of the website. For example see the [bottom of this page](http://wealthometer.org/ES/about.html).

## structure of the website

* there is a central `/css` and `/img` folder at the root of the site.
all country sites are set up as subfolders of the root, with
each of them referring to the root-level css and img.
* Each country folder has their own `js` directory, which contains javascript
code and country-specific data for the tax calculator. 

# copyright

The code in this repository is under copyright by Maximilian Kasy and Florian Oswald, 2015. By contributing you waive all copyright claims on your contribution.

# License

Please click on the license to find out more.


<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a><br />This <span xmlns:dct="http://purl.org/dc/terms/" href="http://purl.org/dc/dcmitype/Text" rel="dct:type">work</span> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.
