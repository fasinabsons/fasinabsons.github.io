import Papa from 'papaparse';
import { Contact, BulkContact } from '../types';

export const parseBulkCSV = (file: File): Promise<Contact[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const contacts: Contact[] = (results.data as unknown[]).map((row: unknown) => {
            const bulkContact = row as BulkContact;
            
            // Handle flexible name formats with prefix/suffix
            let name = '';
            let firstName = '';
            let lastName = '';
            let prefix = '';
            let suffix = '';
            
            // Extract prefix
            prefix = bulkContact.prefix || bulkContact.Prefix || '';
            
            // Extract suffix
            suffix = bulkContact.suffix || bulkContact.Suffix || '';
            
            // Handle first/last names
            if (bulkContact.firstName || bulkContact.Firstname || bulkContact['First Name']) {
              firstName = bulkContact.firstName || bulkContact.Firstname || bulkContact['First Name'] || '';
            }
            
            if (bulkContact.lastName || bulkContact.Lastname || bulkContact['Last Name']) {
              lastName = bulkContact.lastName || bulkContact.Lastname || bulkContact['Last Name'] || '';
            }
            
            // Build full name
            if (bulkContact.name || bulkContact.Name || bulkContact['Full Name']) {
              name = bulkContact.name || bulkContact.Name || bulkContact['Full Name'] || '';
            } else if (firstName || lastName) {
              name = [prefix, firstName, lastName, suffix].filter(Boolean).join(' ');
            }

            // Handle multiple phone number formats with proper types
            const mobilePhone = bulkContact.mobilePhone || bulkContact['Mobile Phone'] || 
                               bulkContact['Phone (Mobile)'] || bulkContact.mobile || bulkContact.Mobile || '';
                               
            const workPhone = bulkContact.workPhone || bulkContact['Work Phone'] || 
                             bulkContact['Phone (Work)'] || bulkContact.work || bulkContact.Work || '';
                             
            const homePhone = bulkContact.homePhone || bulkContact['Home Phone'] || 
                             bulkContact['Phone (Home)'] || bulkContact['Phone (Private)'] || 
                             bulkContact.home || bulkContact.Home || bulkContact.privatePhone || '';
                             
            const faxPhone = bulkContact.faxPhone || bulkContact['Fax Phone'] || 
                            bulkContact['Fax (Work)'] || bulkContact['Fax (Private)'] || 
                            bulkContact.fax || bulkContact.Fax || '';

            // Main phone fallback
            let phone = bulkContact.phone || bulkContact.Phone || '';
            if (!phone && (mobilePhone || workPhone || homePhone)) {
              const phones = [mobilePhone, workPhone, homePhone].filter(Boolean);
              phone = phones.join(' | ');
            }

            // Handle address components
            const street = bulkContact.street || bulkContact.Street || bulkContact['Street Address'] || '';
            const city = bulkContact.city || bulkContact.City || '';
            const state = bulkContact.state || bulkContact.State || bulkContact.Province || bulkContact.province || '';
            const zipcode = bulkContact.zipcode || bulkContact.Zipcode || bulkContact['Zip Code'] || 
                           bulkContact.postal || bulkContact.Postal || bulkContact['Postal Code'] || '';
            const country = bulkContact.country || bulkContact.Country || '';
            
            let address = bulkContact.address || bulkContact.Address || '';
            if (!address && (street || city || state || zipcode || country)) {
              const addressParts = [street, city, state, zipcode, country].filter(Boolean);
              address = addressParts.join(', ');
            }

            // Handle organization details
            const organization = bulkContact.organization || bulkContact.Organization || 
                               bulkContact.company || bulkContact.Company || '';
            const title = bulkContact.title || bulkContact.Title || bulkContact.position || 
                         bulkContact.Position || bulkContact['Job Title'] || '';
            const department = bulkContact.department || bulkContact.Department || '';

            // Handle web presence
            const email = bulkContact.email || bulkContact.Email || bulkContact['Email Address'] || '';
            const website = bulkContact.website || bulkContact.Website || bulkContact.url || 
                           bulkContact.URL || bulkContact.homepage || bulkContact.Homepage || '';

            const contact: Contact = {
              name: name || 'Unknown',
              firstName: firstName,
              lastName: lastName,
              prefix: prefix,
              suffix: suffix,
              email: email,
              phone: phone,
              mobilePhone: mobilePhone,
              workPhone: workPhone,
              homePhone: homePhone,
              faxPhone: faxPhone,
              organization: organization,
              title: title,
              department: department,
              address: address,
              street: street,
              city: city,
              state: state,
              zipcode: zipcode,
              country: country,
              website: website,
              message1: bulkContact.message1 || bulkContact.Message1 || bulkContact['Message 1'] || '',
              message2: bulkContact.message2 || bulkContact.Message2 || bulkContact['Message 2'] || '',
              notes: bulkContact.notes || bulkContact.Notes || ''
            };

            return contact;
          });

          // Filter out completely empty contacts
          const validContacts = contacts.filter(contact => 
            contact.name !== 'Unknown' || contact.email || contact.phone || contact.mobilePhone || contact.workPhone
          );

          resolve(validContacts);
        } catch {
          reject(new Error('Failed to parse CSV file'));
        }
      },
      error: (err) => {
        reject(new Error(`CSV parsing error: ${err.message}`));
      }
    });
  });
};

export const validateBulkContacts = (contacts: Contact[]): { valid: Contact[], errors: string[] } => {
  const valid: Contact[] = [];
  const errors: string[] = [];

  contacts.forEach((contact, index) => {
    const rowErrors: string[] = [];

    if (!contact.name || contact.name.trim() === '' || contact.name === 'Unknown') {
      rowErrors.push('Name is required');
    }

    if (!contact.email && !contact.phone && !contact.mobilePhone && !contact.workPhone && !contact.homePhone) {
      rowErrors.push('At least one contact method (email or phone) is required');
    }

    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      rowErrors.push('Invalid email format');
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
    } else {
      valid.push(contact);
    }
  });

  return { valid, errors };
};

export const downloadSampleCSV = () => {
  const sampleData = [
    {
      'Prefix': 'Dr',
      'First Name': 'Sarah',
      'Last Name': 'Johnson',
      'Suffix': 'PhD',
      'Organization': 'Global Healthcare Solutions',
      'Department': 'Research & Development',
      'Job Title': 'Chief Medical Officer',
      'Mobile Phone': '+1 555 123 4567',
      'Work Phone': '+1 555 234 5678',
      'Home Phone': '+1 555 345 6789',
      'Fax Phone': '+1 555 456 7890',
      'Email Address': 'sarah.johnson@globalhealthcare.com',
      'Website': 'https://globalhealthcare.com',
      'Street Address': '123 Medical Center Drive',
      'City': 'Boston',
      'State': 'Massachusetts',
      'Zip Code': '02101',
      'Country': 'USA',
      'Message 1': 'Advancing Healthcare Innovation',
      'Message 2': 'Available for medical consultations',
      'Notes': 'Board-certified physician with 15+ years experience'
    },
    {
      'Prefix': 'Ms',
      'First Name': 'Maria',
      'Last Name': 'Rodriguez',
      'Suffix': '',
      'Organization': 'Tech Innovators España',
      'Department': 'Technology',
      'Job Title': 'Senior Software Architect',
      'Mobile Phone': '+34 91 123 4567',
      'Work Phone': '+34 91 234 5678',
      'Home Phone': '',
      'Fax Phone': '',
      'Email Address': 'maria.rodriguez@techinnovators.es',
      'Website': 'https://techinnovators.es',
      'Street Address': 'Calle de la Tecnología 45',
      'City': 'Madrid',
      'State': 'Comunidad de Madrid',
      'Zip Code': '28001',
      'Country': 'Spain',
      'Message 1': 'Innovando el Futuro Digital',
      'Message 2': 'Let\'s build amazing software together',
      'Notes': 'Specializes in cloud architecture and AI solutions'
    },
    {
      'Prefix': 'Prof',
      'First Name': 'Hiroshi',
      'Last Name': 'Tanaka',
      'Suffix': '',
      'Organization': 'Tokyo Institute of Technology',
      'Department': 'Computer Science',
      'Job Title': 'Professor of Artificial Intelligence',
      'Mobile Phone': '+81 90 1234 5678',
      'Work Phone': '+81 3 5734 2111',
      'Home Phone': '',
      'Fax Phone': '+81 3 5734 2222',
      'Email Address': 'h.tanaka@titech.ac.jp',
      'Website': 'https://titech.ac.jp/~tanaka',
      'Street Address': '2-12-1 Ookayama, Meguro-ku',
      'City': 'Tokyo',
      'State': 'Tokyo Metropolis',
      'Zip Code': '152-8550',
      'Country': 'Japan',
      'Message 1': 'AIの未来を創造する - Creating AI Future',
      'Message 2': 'Research collaboration welcome',
      'Notes': 'Leading researcher in machine learning and robotics'
    },
    {
      'Prefix': 'Mr',
      'First Name': 'Ahmed',
      'Last Name': 'Al-Farsi',
      'Suffix': '',
      'Organization': 'Gulf Energy Solutions',
      'Department': 'Operations',
      'Job Title': 'Operations Manager',
      'Mobile Phone': '+971 50 123 4567',
      'Work Phone': '+971 2 123 4567',
      'Home Phone': '',
      'Fax Phone': '+971 2 123 4568',
      'Email Address': 'ahmed.farsi@gmail.com',
      'Website': 'https://gulfenergysolutions.ae',
      'Street Address': 'P.O Box 12345',
      'City': 'Abu Dhabi',
      'State': 'Abu Dhabi Emirate',
      'Zip Code': '12345',
      'Country': 'UAE',
      'Message 1': 'Empowering Energy Solutions',
      'Message 2': 'Contact me for energy projects',
      'Notes': 'Experienced in oil and gas operations management'
    },

  ];

  const csv = Papa.unparse(sampleData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Professional_Business_Contacts_Template.csv';
  link.click();
  URL.revokeObjectURL(link.href);
};

// Excel template generator with multiple sheets
export const downloadProfessionalExcelTemplate = () => {
  // Create comprehensive template data
  const templateData = [
    {
      'Prefix': 'Mr',
      'First Name': 'James',
      'Last Name': 'Smith',
      'Suffix': '',
      'Organization': 'Tech Innovations Inc.',
      'Department': 'Technology',
      'Job Title': 'Senior Software Engineer',
      'Mobile Phone': '+1 555 123 4567',
      'Work Phone': '+1 555 987 6543',
      'Home Phone': '',
      'Fax Phone': '+1 555 987 6544',
      'Email Address': 'james.smith@techinnovations.com',
      'Website': 'https://techinnovations.com',
      'Street Address': '123 Tech Lane',
      'City': 'San Francisco',
      'State': 'California',
      'Zip Code': '94105',
      'Country': 'USA',
      'Message 1': 'Innovating the Future',
      'Message 2': 'Specialist in software solutions',
      'Notes': 'Expert in cloud computing and AI'
    },
    {
      'Prefix': 'Ms',
      'First Name': 'Emma',
      'Last Name': 'Brown',
      'Suffix': '',
      'Organization': 'Global Marketing Ltd.',
      'Department': 'Marketing',
      'Job Title': 'Marketing Director',
      'Mobile Phone': '+44 7700 900 123',
      'Work Phone': '+44 20 7946 0958',
      'Home Phone': '',
      'Fax Phone': '+44 20 7946 0959',
      'Email Address': 'emma.brown@globalmarketing.co.uk',
      'Website': 'https://globalmarketing.co.uk',
      'Street Address': '10 Downing Street Annex',
      'City': 'London',
      'State': '',
      'Zip Code': 'SW1A 2AA',
      'Country': 'UK',
      'Message 1': 'Driving Brand Success',
      'Message 2': 'Creative marketing strategies',
      'Notes': 'Award-winning marketing professional'
    },
    {
      'Prefix': 'Mr',
      'First Name': 'Liam',
      'Last Name': 'Wilson',
      'Suffix': '',
      'Organization': 'Aussie Tech Solutions',
      'Department': 'IT Support',
      'Job Title': 'IT Support Specialist',
      'Mobile Phone': '+61 412 345 678',
      'Work Phone': '+61 2 9267 1234',
      'Home Phone': '',
      'Fax Phone': '+61 2 9267 1235',
      'Email Address': 'liam.wilson@aussietech.com.au',
      'Website': 'https://aussietech.com.au',
      'Street Address': '45 Sydney Road',
      'City': 'Sydney',
      'State': 'New South Wales',
      'Zip Code': '2000',
      'Country': 'Australia',
      'Message 1': 'Supporting Your Tech Needs',
      'Message 2': 'Reliable IT solutions',
      'Notes': 'Certified in network administration'
    },
    {
      'Prefix': 'Ms',
      'First Name': 'Olivia',
      'Last Name': 'Taylor',
      'Suffix': '',
      'Organization': 'Creative Designs Co.',
      'Department': 'Design',
      'Job Title': 'Graphic Designer',
      'Mobile Phone': '+1 555 234 5678',
      'Work Phone': '+1 555 876 5432',
      'Home Phone': '',
      'Fax Phone': '+1 555 876 5433',
      'Email Address': 'olivia.taylor@creativedesigns.com',
      'Website': 'https://creativedesigns.com',
      'Street Address': '789 Design Avenue',
      'City': 'Los Angeles',
      'State': 'California',
      'Zip Code': '90001',
      'Country': 'USA',
      'Message 1': 'Crafting Visual Stories',
      'Message 2': 'Expert in digital art',
      'Notes': 'Specializes in UI/UX design'
    },
    {
      'Prefix': 'Mr',
      'First Name': 'Thomas',
      'Last Name': 'Davis',
      'Suffix': '',
      'Organization': 'UK Business Hub',
      'Department': 'Sales',
      'Job Title': 'Sales Manager',
      'Mobile Phone': '+44 7810 456 789',
      'Work Phone': '+44 20 7234 5678',
      'Home Phone': '',
      'Fax Phone': '+44 20 7234 5679',
      'Email Address': 'thomas.davis@ukbusinesshub.co.uk',
      'Website': 'https://ukbusinesshub.co.uk',
      'Street Address': '22 Oxford Street',
      'City': 'Oxford',
      'State': '',
      'Zip Code': 'OX1 2JD',
      'Country': 'UK',
      'Message 1': 'Boosting Sales Growth',
      'Message 2': 'Strategic sales expert',
      'Notes': 'Proven track record in B2B sales'
    }
  ];

  // Create empty template for user to fill
  const emptyTemplate = {
    'Prefix': '',
    'First Name': '',
    'Last Name': '',
    'Suffix': '',
    'Organization': '',
    'Department': '',
    'Job Title': '',
    'Mobile Phone': '',
    'Work Phone': '',
    'Home Phone': '',
    'Fax Phone': '',
    'Email Address': '',
    'Website': '',
    'Street Address': '',
    'City': '',
    'State': '',
    'Zip Code': '',
    'Country': '',
    'Message 1': '',
    'Message 2': '',
    'Notes': ''
  };

  // Add 20 empty rows for user input
  const userTemplate = Array(20).fill(null).map(() => ({ ...emptyTemplate }));
  
  // Combine sample data with empty template
  const finalTemplate = [...templateData, ...userTemplate];
  
  const csv = Papa.unparse(finalTemplate);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Business_Cards_Professional_Template.csv';
  link.click();
  URL.revokeObjectURL(link.href);
};