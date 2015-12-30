# Weekello

Creates a Trello board for a certain year, including a list for each week.


## Instructions
1. First of all, get an API key & secret [here](https://trello.com/app-key).
2. Create a new `.env` file at the root of this project, where you’ll write
your API key & secret like this:
```
TRELLO_KEY=<long-trello-key>
TRELLO_SECRET=<even-longer-trello-secret>
```
3. Run `npm install`.
4. Run `node index.js`.
5. In the new browser window that appeared, click _‘Allow’_ so that the app
can create boards & lists for you.


## Todo
- [ ] Empty the newly created board before creating new lists
- [ ] Make everything more function-oriented
- [ ] Clean up & document the code


## Resources
- [Trello’s API rate limits](http://help.trello.com/article/838-api-rate-limits)
