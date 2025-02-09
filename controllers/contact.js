/*const db = require('../models/index');
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
}*/

const db = require('../models/index');
const { Op } = require('sequelize');
const Contact = db.contact;

const identify = async (req, res) => {
  const { email, phoneNumber } = req.body;

  // Validate input
  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Email or phoneNumber is required.' });
  }

  try {
    // Step 1: Find existing contacts by email or phoneNumber
    const existingContacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { email },
          { phoneNumber },
        ],
      },
      order: [['createdAt', 'ASC']], // Oldest contact first
    });

    let primaryContact = null;
    let secondaryContacts = [];

    if (existingContacts.length === 0) {
      // Step 2: No existing contacts, create a new primary contact
      primaryContact = await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: 'primary',
      });
    } else {
      // Step 3: Existing contacts found
      primaryContact = existingContacts.find(contact => contact.linkPrecedence === 'primary') || existingContacts[0];
      secondaryContacts = existingContacts.filter(contact => contact.linkPrecedence === 'secondary');

      // Step 4: Check if new information is provided
      const hasNewEmail = email && !existingContacts.some(contact => contact.email === email);
      const hasNewPhoneNumber = phoneNumber && !existingContacts.some(contact => contact.phoneNumber === phoneNumber);

      if (hasNewEmail || hasNewPhoneNumber) {
        // Create a new secondary contact
        const newSecondaryContact = await Contact.create({
          email,
          phoneNumber,
          linkedId: primaryContact.id,
          linkPrecedence: 'secondary',
        });
        secondaryContacts.push(newSecondaryContact);
      }

      // Step 5: Handle merging of multiple primary contacts
      const allPrimaryContacts = existingContacts.filter(contact => contact.linkPrecedence === 'primary');
      if (allPrimaryContacts.length > 1) {
        // Convert newer primary contacts to secondary
        const oldestPrimaryContact = allPrimaryContacts.reduce((prev, curr) =>
          prev.createdAt < curr.createdAt ? prev : curr
        );
        const newerPrimaryContacts = allPrimaryContacts.filter(contact => contact.id !== oldestPrimaryContact.id);

        for (const contact of newerPrimaryContacts) {
          await contact.update({
            linkedId: oldestPrimaryContact.id,
            linkPrecedence: 'secondary',
          });
          secondaryContacts.push(contact);
        }

        primaryContact = oldestPrimaryContact;
      }
    }

    // Step 6: Prepare the response
    const emails = [...new Set([primaryContact.email, ...secondaryContacts.map(contact => contact.email)].filter(Boolean))];
    const phoneNumbers = [...new Set([primaryContact.phoneNumber, ...secondaryContacts.map(contact => contact.phoneNumber)].filter(Boolean))];
    const secondaryContactIds = secondaryContacts.map(contact => contact.id);

    const response = {
      contact: {
        primaryContatctId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error identifying contact:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  identify,
};