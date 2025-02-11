/* 
 * Agent700ChromeExtensionWT
 * 
 * This source code is licensed under the MIT License found in the
 * LICENSE file in the root directory of this source tree.
 */

async function is_logged_in(token) {
    const AGENTS_URL = 'https://agent700.ai/api/agents';

    try {
        let response = await fetch(AGENTS_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 200) {
            return true;
        } else {
            throw new Error('Not logged in');
        }
    } catch (error) {
        console.error('Error in is_logged_in:', error);
        return false;
    }
}