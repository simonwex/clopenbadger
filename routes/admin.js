
/*
 * Administrative Pages
 */
exports.index = function (req, res) {
  return res.render('admin/index.html', {
    issuer: req.issuer
  });
};

exports.login = function (req, res) {
  var path = req.query['path'] || req.body['path'] || '/admin';
  return res.render('admin/login.html', {
    issuer: req.issuer,
    issuerCheckExempt: true,
    path: path
  });
}

exports.newBadgeForm = function (req, res) {
  return res.render('admin/new-badge.html', {
    issuer: req.issuer
  });
};

exports.newBehaviorForm = function (req, res) {
  return res.render('admin/new-behavior.html', {
    issuer: req.issuer,
    badgeShortName: req.query['for']
  });
};

exports.badgeIndex = function (req, res) {
  return res.render('admin/badge-index.html', {
    issuer: req.issuer,
    badges: req.badges
  });
};

exports.showBadge = function (req, res) {
  return res.render('admin/show-badge.html', {
    issuer: req.issuer,
    defaultBehavior: req.query['behavior'],
    badge: req.badge,
    behaviors: req.behaviors
  });
};

exports.configure = function (req, res) {
  return res.render('admin/config.html', {
    issuer: req.issuer,
    issuerCheckExempt: true
  });
};
