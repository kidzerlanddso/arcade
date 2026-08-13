const db = require("./db");

// TODO: complete the code as per the instructions given README.md

const Project = function(profile) {
  this.firstname = profile.firstname;
  this.lastname = profile.lastname;
  this.email = profile.email;
  this.year = profile.year;
  this.student_id = profile.student_id;
  this.user_id = profile.user_id;
};



// RETRIEVE all profiles
Project.getAll = (result) => {
  db.query("SELECT * FROM profile", (err, res) => {
    if (err) {
      console.log("GetAll error: ", err);
      result(err, null);
      return;
    }
    result(null, res);
  });
};

// RETRIEVE a profile by ID
Project.findById = (id, result) => {
  db.query("SELECT * FROM profile WHERE id = ?", [id], (err, res) => {
    if (err) {
      console.log("FindById error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      result(null, res[0]);
      return;
    }

  });
};

// CREATE a new profile
Project.create = (newProfile, result) => {
  db.query("INSERT INTO profile SET ?", newProfile, (err, res) => {
    if (err) {
      console.log("Create error: ", err);
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newProfile });
  });
};

// RETRIEVE a profile by Name 
Project.findByName = (name, result) => {
  db.query("SELECT * FROM profile WHERE firstname LIKE ? OR lastname LIKE ?", [`%${name}%`, `%${name}%`], (err, res) => {
    if (err) {
      console.log("findByName error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      result(null, res);
      return;
    }

  });
};


// UPDATE a profile by ID 
Project.updateById = (id, profile, result) => {
  const fields = [];
  const values = [];

  for (const key in profile) {
    fields.push(`${key} = ?`);
    values.push(profile[key]);
  }

  values.push(id);

  db.query(`UPDATE profile SET  ${fields.join(", ")} WHERE id = ?`, 
   values,
   (err, res) => {
      if (err) {
      console.log("Error while Updating : ", err);
      result(err, null);
      return;
    }

    if (res.affectedRows === 0) {
      result({ kind: "not_found" }, null);
      return;
    }
  result(null, { id: id, ...profile });
 }

  );
};


// DELETE a profile by ID
Project.deleteById = (id, result) => {
  db.query("UPDATE `users` SET `active` = '0' WHERE `users`.`id`= ?", [id], (err, res) => {
    if (err) {
      console.log("Error while Deleting: ", err);
      result(err, null);
      return;
    }

    if (res.affectedRows === 0) {
      result({ kind: "NO such ID found" }, null);
      return;
    }

    result(null, res);
  });
};


// DELETE all profiles

//Project.eraseAll = (result) => {
//  db.query("DELETE FROM profile", (err, res) => {
//   if (err) {       console.log("error while deleting: ", err);      result(err, null);
//      return;     }
//    result(null, res);  });  
//  };


module.exports = Project;