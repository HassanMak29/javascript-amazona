import { getUserInfo } from '../localStorage';
import { parseRequestUrl } from '../utils';

const Header = {
  after_render: () => {
    document.getElementById('search-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const searchKeyword = document.getElementById('q').value;
      document.location.hash = `/?q=${searchKeyword}`;
    });
  },

  render: () => {
    const { name, isAdmin } = getUserInfo();
    const { value } = parseRequestUrl();
    return `
        <div class="brand">
            <a href="/#/">Amazona</a>
        </div>
        <div class="search">
          <form class="search-form" id="search-form">
            <input type="text" name="q" id="q" value="${value || ''}"/>
            <button type="submit"><i class="fa fa-search"></i></button>
          </form>
        </div>
        <div>
        ${
          name
            ? `<a href="/#/profile">${name}</a>`
            : '<a href="/#/signin">Sign In</a>'
        }
            
            <a href="/#/cart">Cart</a>
            ${isAdmin ? `<a href="/#/dashboard">Dashboard</a>` : ''}
        </div>
    `;
  },
};

export default Header;
