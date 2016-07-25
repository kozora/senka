Experimentations on [senka.me](https://www.senka.me/) reimplementation.
* Supported servers:
  * Saiki Bay
  * Hashirajima (soon™)
  * In theory, other servers also can be added
* A semi-automatic way of updating from KCV and EO (soon™) logs is implemented, automatic submission isn't implemented and not planned
* Implemented features (see What section): server Top N graphs and Top 990 ranking tables

# Why
[senka.me](https://www.senka.me/) [stopped updating](https://twitter.com/noisy_sgr/status/754026657753669633) on 2016/07/15 due to the [API change](https://github.com/andanteyk/ElectronicObserver/commit/061d405887311bb1ad5f0138c559d6129dbd2602): `api_member_id`, `api_level`, and `api_experience` were removed (and `api_rate` encrypted), the main consequences are:
* Exact user tracking is impossible anymore, `api_member_id` was used as an unique user identifier, with `https://www.senka.me/player/<api_member_id>` being a user page. Now `api_nickname` can be used for tracking, with `/player/<api_nickname>` for player pages, but that introduces significant number of conflicts between users (using `api_nickname` together with `api_medals` will still give conflicts), so that `/player/<api_nickname>` should be able to track more than one user, that means that
  * A scatter plot should be used instead of line graph on conflicts
  * Line graphs can be still restored using multivariate regression
  * Increment charts also can be restored for those line graphs
  * No way to distinguish between those players with the same `api_nickname`, therefore, `api_comment` and `api_medals` history per each user isn't possible anymore
* `api_level` history isn't possible even without conflicts
* No way to track EO points due to removal of `api_experience`

# What
Otherwise, it is still possible to implement the following features:
* `/all`: top 10 players on all servers: overall points and increments: place, server, name, comment, points/increments; links to player pages
* `/all/ranking`: top 10000 ranking list for all servers: overall place with difference, own place with difference, server, name, comment, points with increment, medals; links to player pages
* `/<server>`: overview for a server: charts for points and average increments (for day, night, and cycle) for top 1, 5, 20, 100, and 500
* `/<server>/ranking`: top 990 ranking list of a server: own place with difference, overall place with difference, name, comment, points with increment, medals; links to player pages
* `/player/<name>`: name, comment, medals, server, place, overall place, current points, comment history (when no conflicts), place chart (line graph, scatter plot with restored lines on conflicts), increment chart (for day, night, and cycle, restored on conflicts), points chart relatively to Top 1, 2, 5, 20, or 500 bounds (line graph, scatter plot with restored lines on conflicts)

# How
Install dependencies:

    npm install
    typings install

Create `api/config.json` (see `api/config.example.json`, `member_id` is client's `api_member_id`, `api_direcory` is `ResponseData\kcsapi\api_req_ranking\getlist` for [KCV](https://github.com/gakada/KanColleViewer/releases) (using modified [SaveResponsePlugin](https://github.com/veigr/SaveResponsePlugin)) or `KCAPI` for [EO](https://github.com/andanteyk/ElectronicObserver)) and build API indexes for the site:

    ./build

Run a HTTP server in `site/`
