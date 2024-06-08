const db = require('../models/index');
const { Op } = require('sequelize');
const Contact = db.contact;


// const addContact = async (req, res) => {

//     let info = {
//         email: req.body.email,
//         phoneNumber: req.body.phoneNumber,
//     }

//     const contact = await Contact.create(info)
//     res.status(200).send(contact)
//     console.log(contact)

// }


const identify = async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Email or phoneNumber is required.' });
  }

  try {
    let primaryContact = null;
    let secondaryContacts = [];

    // Find existing contacts by email or phoneNumber
    const existingContacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { email },
          { phoneNumber },
        ],
      },
      order: [['createdAt', 'ASC']],
    });

    if (existingContacts.length > 0) {
      primaryContact = existingContacts[0];
      secondaryContacts = existingContacts.slice(1);
      if(primaryContact.email === email && primaryContact.phoneNumber === phoneNumber && primaryContact.linkPrecedence === 'primary') {
      
          return res.status(200).json({ messgae: 'Contact already exists'});
      }
      else if(primaryContact.email === email && primaryContact.phoneNumber !== phoneNumber || primaryContact.email !== email && primaryContact.phoneNumber === phoneNumber) {
        let otherContact = await Contact.findAll({
            where: {
                [Op.and]: [
                { email },
                { phoneNumber},
                ],
                linkPrecedence: 'secondary',
            },
            order: [['createdAt', 'ASC']],
            });
        if(otherContact.length === 0) {
            // console.log("heelo");
            let twoContacts = await Contact.findAll({
                where: {
                    [Op.or]: [
                        { email },
                        { phoneNumber },
                    ],
                    linkPrecedence: 'primary',
                },
                order: [['createdAt', 'ASC']],
            });
            if(twoContacts.length >= 2) {
                let flag=true;
                for (const contact of twoContacts) {
                    if(flag){
                        falg=false;
                        continue;
                    }
                    let secondContact = await contact.update({ linkedId: primaryContact.id, linkPrecedence: 'secondary'});
                    secondaryContacts.push(secondContact);
                }
            }
            else{

            let anotherContact= await Contact.create({ email, phoneNumber,linkedId: primaryContact.id, linkPrecedence: 'secondary' });
              secondaryContacts.push(anotherContact);
            }
            // secondaryContacts = secondaryContacts.filter(c => !otherContacts.includes(c));
        }
        else{
            // console.log("heelo2");
            if(secondaryContacts.length > 0){
            for (const contact of secondaryContacts) {
                await contact.update({ linkedId: primaryContact.id, linkPrecedence: 'secondary'});
              }
            }
        }
      }
    } else {
      primaryContact = await Contact.create({ email, phoneNumber, linkPrecedence: 'primary' });
    }

    const response = {
      primaryContactId: primaryContact.id,
      emails: [primaryContact.email, ...secondaryContacts.map(c => c.email)].filter(Boolean),
      phoneNumbers: [primaryContact.phoneNumber, ...secondaryContacts.map(c => c.phoneNumber)].filter(Boolean),
      secondaryContactIds: secondaryContacts.map(c => c.id),
    };

    return res.status(200).json({ contact: response });
  } catch (error) {
    console.error('Error identifying contact:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
    identify
}