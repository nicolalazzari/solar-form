import { useState, useCallback } from 'react';
import styles from './PostcodeAddressDropdown.module.css';

export default function PostcodeAddressDropdown({
  postcode,
  onAddressSelect,
  onPostcodeChange
}) {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const lookupPostcode = useCallback(async (postcodeValue) => {
    if (!postcodeValue || postcodeValue.length < 5) {
      setAddresses([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/getaddress-lookup?postcode=${encodeURIComponent(postcodeValue)}`);

      if (!response.ok) {
        throw new Error('Failed to lookup postcode');
      }

      const data = await response.json();
      setAddresses(data.addresses || []);
      setIsOpen(true);
    } catch (err) {
      setError('Unable to find addresses for this postcode. Please try again.');
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePostcodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    onPostcodeChange?.(value);

    // Auto-lookup when postcode looks complete
    if (value.replace(/\s/g, '').length >= 5) {
      lookupPostcode(value);
    }
  };

  const handleAddressSelect = async (address) => {
    setSelectedAddress(address);
    setIsOpen(false);

    // Geocode the selected address
    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.fullAddress }),
      });

      if (!response.ok) {
        throw new Error('Failed to geocode address');
      }

      const geocodeData = await response.json();

      onAddressSelect?.({
        fullAddress: address.fullAddress,
        latitude: geocodeData.latitude,
        longitude: geocodeData.longitude,
      });
    } catch (err) {
      setError('Unable to verify address. Please try again.');
    }
  };

  const handleFindAddress = () => {
    lookupPostcode(postcode);
  };

  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor="postcode">
        Postcode
      </label>

      <div className={styles.inputGroup}>
        <input
          id="postcode"
          type="text"
          className={styles.input}
          value={postcode}
          onChange={handlePostcodeChange}
          placeholder="Enter your postcode"
          maxLength={8}
        />
        <button
          type="button"
          className={styles.findButton}
          onClick={handleFindAddress}
          disabled={isLoading || !postcode}
        >
          {isLoading ? 'Finding...' : 'Find Address'}
        </button>
      </div>

      {error && (
        <p className={styles.error}>{error}</p>
      )}

      {isOpen && addresses.length > 0 && (
        <div className={styles.dropdown}>
          <p className={styles.dropdownHeader}>
            {addresses.length} address{addresses.length !== 1 ? 'es' : ''} found
          </p>
          <ul className={styles.addressList}>
            {addresses.map((address, index) => (
              <li key={index}>
                <button
                  type="button"
                  className={styles.addressOption}
                  onClick={() => handleAddressSelect(address)}
                >
                  {address.fullAddress}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedAddress && (
        <div className={styles.selectedAddress}>
          <span className={styles.selectedLabel}>Selected address:</span>
          <span className={styles.selectedValue}>{selectedAddress.fullAddress}</span>
        </div>
      )}
    </div>
  );
}
