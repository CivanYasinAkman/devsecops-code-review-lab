// ruleid: no-raw-sequelize-query
models.sequelize.query(`SELECT * FROM Users WHERE email = '${email}'`)

// ok: no-raw-sequelize-query
models.sequelize.query(`SELECT * FROM Users WHERE email = :email`, { replacements: { email } })