import { GithubUser } from "./GithubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login.toLowerCase() === username.toLowerCase())

      if (userExists) throw new Error('User already exists!')

      const githubUser = await GithubUser.search(username)

      if (githubUser.login === undefined) {
        throw new Error('User not found!')
      }

      this.entries = [githubUser, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    this.entries = this.entries
      .filter(entry => entry.login !== user.login)

    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')
    const inputField = this.root.querySelector('.search input')

    addButton.onclick = () => {
      const { value } = inputField
      if (value) {
        this.add(value)
        inputField.value = ''
      }
    }
  }

  update() {
    this.removeAllTr()

    if (this.entries.length === 0) {
      const emptyList = this.emptyList();
      this.tbody.append(emptyList)
      return
    }

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user span').textContent = '/' + user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => this.delete(user)

      this.tbody.append(row)
    })
  }

  emptyList() {
    const tr = document.createElement('tr')
    tr.classList.add('empty-tr')

    tr.innerHTML = `
      <td colspan="4">
        <div class="empty-message">
          <img src="./images/star-table.svg" alt="Star icon">
          Nenhum favorito ainda
        </div>
      </td>
    `

    return tr
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/brunolelis.png" alt="">
        <a href="https://github.com/brunolelis" target="_blank">
          <p>Bruno Lelis</p>
          <span>brunolelis</span>
        </a>
      </td>
      <td class="repositories">
        987
      </td>
      <td class="followers">
        96569
      </td>
      <td>
        <button class="remove">Remover</button>
      </td>
    `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(element => {
      element.remove()
    });
  }
}