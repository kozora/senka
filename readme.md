# About

[gakada.github.io/senka](https://gakada.github.io/senka/): experimentations on [senka.me](https://www.senka.me/) reimplementation

### Supported servers

* #17 [Kanoya](https://gakada.github.io/senka/kanoya_ranking.html) (since late July)
* #18 Iwagawa (?)
* #19 [Saiki Bay](https://gakada.github.io/senka/saiki_ranking.html) (since July)
* #20 Hashirajima (since August)
* [The client tool](https://github.com/gakada/senka/releases) can be used for other servers as well

### Implemented features

* Top 1/5/20/100/500 graphs for servers ([example](https://gakada.github.io/senka/saiki.html))
* Sortable ranking tables for servers (top 990 on one page), with stats for current top 1/5/10/20/50/100/500/990 points, increments, and medals ([example](https://gakada.github.io/senka/saiki_ranking.html))

### Roadmap

*Priorities*

* v0.2 for [client](https://github.com/gakada/senka/releases): automatic viewer detection (KCV and EO), `*.bat` files for testing, GUI improvements, `collect.exe` (no sending), usage instructions
  * [SaveResponsePlugin](https://github.com/veigr/SaveResponsePlugin) build for [Grabacr07](https://github.com/Grabacr07/KanColleViewer)/[Yuubari](https://github.com/Yuubari/KanColleViewer) KCV
  * v0.3: support other viewers (or just browsers) using a proxy
* Support Iwagawa
  * etc.
* Overview for current top 1/2/3/4/5/10/15/20/50/100/500/990 points with highlighting for servers
  * A page with highlighted end-month tables for all servers for each month ([example](https://twitter.com/yoru02_rbul/status/748485998590341120))
* Average increments charts for servers
* Implement player pages: info, comments, place and points graphs, increment history, average increments
  * Start with a few players
  * Add ability to use reference curves (from previous months), display 5-4 waterlines by calculating required speed based on target points and current EO points (entered by a user)
  * Architecture and storage estimations for 100 * 20 / 500 * 20 / 990 * 20 / ... players
* Localization: Japanese, English
* Address github caching issues
* Improve fonts?

*Other*

* Scatter plots and regression on conflicts for player charts
* Top 10 in points/increments over all servers; top ~10000 over all servers; support for overall ranking info for players
  * Requires support for all servers

# Notes

### Client

[The client tool](https://github.com/gakada/senka/releases) sends the following data:

* `api_nickname` (from `api_port` > `api_basic`): identification
* `api_memeber_id` (from `api_port` > `api_basic`): identification, also used for `api_rate` decoding
* `api_list` (from `api_req_ranking/getlist`): ranking data itself, collected into a list of 990 players from the ranking pages, for each player:
  * `api_no`: ranking place
  * `api_rank`: rank (always Marshal in top 990)
  * `api_nickname`: name
  * `api_comment`: comment
  * `api_rate`: ranking points (encoded)
  * `api_flag`: flag icon (always gold in top 990)
  * `api_medals`: medals

### This repository

* [gh-pages](https://github.com/gakada/senka/tree/gh-pages) branch is "up to date", since it's used to render the site as it is, no DB is used for the site currently
* [master](https://github.com/gakada/senka/tree/master) branch can be outdated
* Is still in prototyping stage, no rigid architecture for different parts (the current scheme is submission client → server → report DB → response builder → site (pre-build responses) → client)

### senka.me and API

[senka.me](https://www.senka.me/) [stopped updating](https://twitter.com/noisy_sgr/status/754026657753669633) on 2016/07/15 due to the [API change](https://github.com/andanteyk/ElectronicObserver/commit/061d405887311bb1ad5f0138c559d6129dbd2602): `api_member_id`, `api_level`, and `api_experience` were removed (and `api_rate` encrypted), the main consequences are:
* Exact player tracking is impossible anymore, `api_member_id` was used as a unique player identifier, with `/player/<api_member_id>` being a player page. Now `api_nickname` can be used for tracking, with `/player/<api_nickname>` for player pages, but that introduces significant number of conflicts between players (using `api_nickname` together with `api_medals` will still give conflicts). Thus, `/player/<api_nickname>` should be able to track more than one player, that means that
  * A scatter plot should be used instead of line graph on conflicts
  * Line graphs can be still restored using multivariate regression
  * Increment charts also can be restored for those line graphs
  * Comment history should include medals, ranking place and points (on comment change), so that grouping is possible on conflicts
* `api_level` history isn't possible even without conflicts (no level data in API)
* No way to track EO points due to removal of `api_experience`
