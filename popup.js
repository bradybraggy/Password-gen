document.addEventListener('DOMContentLoaded', function () {
  const passwordDisplay = document.getElementById('password');
  const generateButton = document.getElementById('generatePassword');
  const saveButton = document.getElementById('savePassword');
  const viewPasswordsButton = document.getElementById('viewPasswords');
  const removePasswordButton = document.getElementById('removePassword');
  const removePasswordInput = document.getElementById('removePasswordInput');
  const copyToClipboardButton = document.getElementById('copyToClipboard');
  const websiteInput = document.getElementById('websiteInput');
  const passwordListContainer = document.getElementById('passwordList');
  const passwordLengthInput = document.getElementById('passwordLength');
  const passwordTypeSelect = document.getElementById('passwordType');
  const passwordStrengthDiv = document.getElementById('passwordStrength');

  generateButton.addEventListener('click', function () {
    const password = generatePassword(passwordLengthInput.value, passwordTypeSelect.value);
    passwordDisplay.textContent = password;
    updatePasswordStrength(password);
  });

  saveButton.addEventListener('click', function () {
    const password = passwordDisplay.textContent;
    const website = websiteInput.value.trim();
    
    if (password && website) {
      savePassword(password, website);
      alert(`Password saved for ${website}!`);
    } else {
      alert('Generate a password, enter a website name, and customize settings to save.');
    }
  });

  viewPasswordsButton.addEventListener('click', function () {
    viewPasswords();
  });

  removePasswordButton.addEventListener('click', function () {
    const passwordToRemove = removePasswordInput.value;
    if (passwordToRemove) {
      removePassword(passwordToRemove);
      alert('Password removed!');
    } else {
      alert('Enter a password to remove.');
    }
  });

  copyToClipboardButton.addEventListener('click', function () {
    copyToClipboard(passwordDisplay.textContent);
  });

  function generatePassword(length, type) {
    let charset = '';

    if (type === 'alphanumeric') {
      charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    } else if (type === 'numeric') {
      charset = '0123456789';
    } else if (type === 'alphabetic') {
      charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    } else if (type === 'all') {
      charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset.charAt(randomIndex);
    }
    return password;
  }

  function updatePasswordStrength(password) {
    const strength = calculatePasswordStrength(password.length);
    passwordStrengthDiv.textContent = `Password Strength: ${strength}`;
    passwordStrengthDiv.style.color = strengthColor(strength);
  }

  function calculatePasswordStrength(length) {
    if (length < 8) {
      return 'Weak';
    } else if (length < 12) {
      return 'Moderate';
    } else {
      return 'Strong';
    }
  }

  function strengthColor(strength) {
    switch (strength) {
      case 'Weak':
        return 'red';
      case 'Moderate':
        return 'orange';
      case 'Strong':
        return 'green';
      default:
        return 'black';
    }
  }

  function savePassword(password, website) {
    chrome.storage.sync.get('passwords', function (data) {
      const passwords = data.passwords || [];
      passwords.push({ password, website });
      chrome.storage.sync.set({ passwords: passwords });
    });
  }

  function viewPasswords() {
    chrome.storage.sync.get('passwords', function (data) {
      const passwords = data.passwords || [];

      // Clear previous password list
      passwordListContainer.innerHTML = '';

      // Display a button for each password
      passwords.forEach(function ({ password, website }) {
        // Check if website and password are defined
        if (website !== undefined && password !== undefined) {
          const copyButton = document.createElement('button');
          copyButton.textContent = 'Copy';
          copyButton.addEventListener('click', function () {
            copyToClipboard(password);
          });

          const passwordDiv = document.createElement('div');
          passwordDiv.textContent = `Website: ${website}, Password: ${password}`;
          passwordDiv.appendChild(copyButton);

          passwordListContainer.appendChild(passwordDiv);
        }
      });
    });
  }

  function removePassword(passwordToRemove) {
    chrome.storage.sync.get('passwords', function (data) {
      let passwords = data.passwords || [];
      const indexToRemove = passwords.findIndex(item => item.password === passwordToRemove);

      if (indexToRemove !== -1) {
        passwords.splice(indexToRemove, 1);
        chrome.storage.sync.set({ passwords: passwords });
      }
    });
  }

  function copyToClipboard(password) {
    navigator.clipboard.writeText(password)
      .then(() => {
        alert('Password copied to clipboard!');
      })
      .catch(() => {
        alert('Failed to copy password to clipboard.');
      });
  }
});
