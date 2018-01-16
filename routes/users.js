const express = require('express');
const router = express.Router();
const pg = require('pg');
const path = require('path');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5432/controle_financeiro';

/* Create a new user */
router.post('/', (req, res, next) => {
  const results = [];
  const data = req.body;

  pg.connect(connectionString, (err, client, done) => {
    if (err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    client.query("INSERT INTO tb_users(user_name, user_email, user_password, user_storage_date, user_status) VALUES($1, $2, $3, $4, $5)", 
                  [data.user_name, data.user_email, data.user_password, data.user_storage_date, data.user_status]);
    const query = client.query("SELECT * FROM tb_users ORDER BY user_name");

    query.on('row', (row) => {
      results.push(row);
    });

    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

/* List all registered users. */
router.get('/', function(req, res, next) {
  const results = [];

  pg.connect(connectionString, (err, client, done) => {
    if (err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    const query = client.query("SELECT * FROM tb_users ORDER BY user_name");

    query.on('row', (row) => {
      results.push(row);
    });

    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

/* Update a registered user */
router.put('/:user_id', (req, res, next) => {
  const results = [];
  const user_id = req.params.user_id;
  const data = req.body;

  pg.connect(connectionString, (err, client, done) => {
    if (err) {
      done();
      console.log(err);
      return res.status(500).json({success:false, data:err});
    }

    let count = 0;
    let updateQuery = "UPDATE tb_users SET ";
    const updateValues = [];
    Object.keys(data).map((el, key, arr) => {
      if (typeof data[el] === 'string') {
        updateQuery += el + " = $" + (key + 1) + ", ";
        updateValues.push(data[el]);
      } else {
        updateQuery += el + " = $" + (key + 1) + ", ";
        updateValues.push(data[el]);
      }
      count++;
    });
    updateValues.push(user_id);
    updateQuery = updateQuery.substring(0, updateQuery.length - 2) + " ";
    updateQuery += "WHERE user_id = $" + (count + 1);

    client.query(updateQuery, updateValues);

    const query = client.query("SELECT * FROM tb_users ORDER BY user_name");

    query.on('row', (row) => {
      results.push(row);
    });

    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

/* Delete a registered user by primary key */
router.delete('/:user_id', (req, res, next) => {
  const results = [];
  const user_id = req.params.user_id;

  pg.connect(connectionString, (err, client, done) => {
    if (err) {
      done();
      console.log(err);
      return res.status(500).json({success:false, data:err});
    }

    client.query("DELETE FROM tb_users WHERE user_id = $1", [user_id]);

    const query = client.query("SELECT * FROM tb_users ORDER BY user_name");

    query.on('row', (row) => {
      results.push(row);
    });

    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

/* Find a registered user by primary key */
router.get('/:user_id', (req, res, next) => {

  user.findByPk(req.params.user_id);

  const result = {};
  const user_id = req.params.user_id;

  pg.connect(connectionString, (err, client, done) => {
    if (err) {
      done();
      console.log(err);
      return res.status(500).json({success:false, data:err});
    }

    const query = client.query("SELECT * FROM tb_users WHERE user_id = $1", [user_id]);

    query.on('row', (row) => {
      Object.keys(row).map((el, index, arr) => {
        result[el] = row[el];
      });
    });

    query.on('end', () => {
      done();
      return res.json(result);
    });
  });
});

router.post('/authenticate', (req, res, next) => {
  const username = req.body.username;
  const userObj = {};
  
  pg.connect(connectionString, (err, client, done) => {
    if (err) {
      done();
      console.log(err);
      return res.status(500).json({success:false, data:err});
    }

    const query = client.query("SELECT * FROM tb_users WHERE user_email = $1", [username]);

    query.on('row', (row) => {
      Object.keys(row).map((el, key, arr) => {
        userObj[el] = row[el];
      });
    });

    query.on('end', () => {
      done();
      if (!userObj.user_id) {
        return res.status(404).json({success:false, message:"Não encontramos nenhum usuário com este e-mail!"});
      } else if (userObj.user_password != req.body.password) {
        return res.status(404).json({success:false, message:"A senha informada não confere!"});
      } else if (!userObj.user_status) {
        return res.status(500).json({success:false, message:"Este usuário está desativado!"});
      }
      return res.json(userObj);
    });
  });
});

module.exports = router;
