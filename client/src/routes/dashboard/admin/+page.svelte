<script>
  import Sidebar from "$lib/components/Sidebar.svelte"
  import AlertModal from "$lib/components/AlertModal.svelte"
  import { userDetails } from "../../../stores/userDetails.js"
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"

  let showAlertModal = false
  let alertModalOptions = {}
  let alertReason

  let users = []
  let images = []
  let totalUsers = 0
  let totalImages = 0
  let totalUsersFound = 0
  let totalImagesFound = 0

  let currentPageForUsers = 1
  let currentPageForImages = 1
  let customPage
  let resultsPerPage = 10
  let customResultsPerPage

  let clickedBox = "users"
  let first = true

  let imageIdGiven
  let userIdGiven

  let searchColumn = "id"
  let searchQuery
  let columns = []

  let sortByQuery = "id",
    sortOrderQuery = "ASC"

  $: console.log(sortByQuery)

  const fetchUsersOrImages = async () => {
    const queryParams = new URLSearchParams({
      offset: ((clickedBox === "users" ? currentPageForUsers : currentPageForImages) - 1) * resultsPerPage,
      limit: resultsPerPage,
      sortBy: sortByQuery,
      sortOrder: sortOrderQuery,
      showDeleted: true,
      showFlagged: true,
    })

    if (searchQuery) {
      queryParams.append("searchQuery", searchQuery)
    }

    if (searchColumn) {
      queryParams.append("searchColumn", searchColumn)
    }

    if (first) {
      const responseUsers = await fetch(`http://localhost:4000/users?${queryParams}`, {
        method: "GET",
        credentials: "include",
      })

      const responseImages = await fetch(`http://localhost:4000/images?${queryParams}`, {
        method: "GET",
        credentials: "include",
      })

      const dataUsers = await responseUsers.json()
      const dataImages = await responseImages.json()

      totalUsers = dataUsers.totalUsers || 0
      totalUsersFound = totalUsers
      users = dataUsers.data || []
      totalImages = dataImages.totalImages || 0
      totalImagesFound = totalImages
      images = dataImages.data || []

      first = false
      if (users.length > 0) {
        columns = Object.keys(users[0])
      }
      return
    }

    const url = `http://localhost:4000/${clickedBox === "users" ? "users" : "images"}?${queryParams}`
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    })
    const data = await response.json()

    if (clickedBox === "users") {
      totalUsers = data.totalUsers || 0
      totalUsersFound = data.totalNeededUsers

      users = data.data || []
    } else {
      totalImages = data.totalImages || 0
      totalImagesFound = data.totalNeededImages
      images = data.data || []
    }
  }

  const handleClick = async (box) => {
    clickedBox = box
    columns = Object.keys(clickedBox === "users" ? users[0] : images[0])
    searchQuery = ""
    await fetchUsersOrImages()
  }

  const nextPage = async () => {
    if (clickedBox === "users") {
      currentPageForUsers++
      await fetchUsersOrImages()
    } else if (clickedBox === "images") {
      currentPageForImages++
      await fetchUsersOrImages()
    }
    fetchUsersOrImages()
  }

  const prevPage = async () => {
    if (clickedBox === "users") {
      if (currentPageForUsers > 1) {
        currentPageForUsers--
        await fetchUsersOrImages()
      }
    } else if (clickedBox === "images") {
      if (currentPageForImages > 1) {
        currentPageForImages--
        await fetchUsersOrImages()
      }
    }
  }

  const toStartPage = async () => {
    if (clickedBox === "users") {
      currentPageForUsers = 1
      await fetchUsersOrImages()
    } else if (clickedBox === "images") {
      currentPageForImages = 1
      await fetchUsersOrImages()
    }
  }
  const toEndPage = async () => {
    if (clickedBox === "users") {
      currentPageForUsers = Math.ceil(totalUsersFound / resultsPerPage)
      await fetchUsersOrImages()
    } else if (clickedBox === "images") {
      currentPageForImages = Math.ceil(totalImagesFound / resultsPerPage)
      await fetchUsersOrImages()
    }
  }

  const changeResultsPerPage = async () => {
    resultsPerPage = customResultsPerPage > 0 ? customResultsPerPage : 10
    if (clickedBox === "users") {
      await fetchUsersOrImages()
    } else if (clickedBox === "images") {
      await fetchUsersOrImages()
    }
  }

  const toCustomPage = async () => {
    let totalPages
    if (clickedBox === "users") {
      totalPages = Math.ceil(totalUsersFound / resultsPerPage)
      if (customPage >= 1 && customPage <= totalPages) {
        currentPageForUsers = customPage
        await fetchUsersOrImages()
      } else {
        alertModalOptions.header = "Page not found"
        alertModalOptions.message = "Total number of pages for users is: " + totalPages
        alertModalOptions.type = "others"
        showAlertModal = true
      }
    } else if (clickedBox === "images") {
      totalPages = Math.ceil(totalImagesFound / resultsPerPage)
      if (customPage >= 1 && customPage <= totalPages) {
        currentPageForImages = customPage
        await fetchUsersOrImages()
      } else {
        alertModalOptions.header = "Page not found"
        alertModalOptions.message = "Total number of pages for images is: " + totalPages
        alertModalOptions.type = "others"
        showAlertModal = true
      }
    }
  }

  const onAlertConfirm = () => {
    if (alertReason === "noAccess") {
      goto("/")
    }
    showAlertModal = false
  }

  const handleImageFlagging = async (flag) => {
    const response = await fetch(`http://localhost:4000/images/${imageIdGiven}`, {
      method: "PATCH",
      credentials: "include",
      body: JSON.stringify({ isFlagged: flag }),
      headers: {
        "Content-Type": "application/json",
      },
    })
    const reply = await response.json()

    if (response.ok) {
      alertModalOptions.header = "Operation succeeded"
      alertModalOptions.message = flag ? "Image has been flagged." : "Image has been unflagged."
      alertModalOptions.type = "success"
      showAlertModal = true
      images = []
      await fetchUsersOrImages("images")
    } else {
      alertModalOptions.header = "Operation failed"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  }

  const handleImageDeletion = async (del) => {
    let response
    if (del) {
      response = await fetch(`http://localhost:4000/images/${imageIdGiven}`, {
        method: "DELETE",
        credentials: "include",
      })
    } else {
      response = await fetch(`http://localhost:4000/images/${imageIdGiven}`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ destroyTime: null }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    const reply = await response.json()

    if (response.ok) {
      alertModalOptions.header = "Operation succeeded"
      alertModalOptions.message = del ? "Image has been deleted." : "Image has been restored."
      alertModalOptions.type = "success"
      showAlertModal = true
    } else {
      alertModalOptions.header = "Operation failed"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
    images = []
    await fetchUsersOrImages("images")
  }

  const handleUserDeletion = async (del) => {
    let response
    if (del) {
      response = await fetch(`http://localhost:4000/users/${userIdGiven}`, {
        method: "DELETE",
        credentials: "include",
      })
    } else {
      response = await fetch(`http://localhost:4000/users/${userIdGiven}`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ destroyTime: null }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    const reply = await response.json()

    if (response.ok) {
      alertModalOptions.header = "Operation succeeded"
      alertModalOptions.message = del ? "User has been deleted." : "User has been restored."
      alertModalOptions.type = "success"
      showAlertModal = true
      users = []
      await fetchUsersOrImages("users")
    } else {
      alertModalOptions.header = "Operation failed"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  }

  const checkWhetherAdmin = async () => {
    if (!$userDetails.isAdmin) {
      alertModalOptions.header = "Cannot access page"
      alertModalOptions.message = "This page is only accessible by an admin."
      alertModalOptions.type = "failure"
      showAlertModal = true
      alertReason = "noAccess"
    }
  }

  const handleSearchChange = async () => {
    currentPageForUsers = 1
    currentPageForImages = 1
    await fetchUsersOrImages()
  }

  onMount(async () => {
    await fetchUsersOrImages()
    await checkWhetherAdmin()
  })
</script>

<div class="container-fluid p-0 m-0">
  <Sidebar />
  <div class=" d-flex align-items-center flex-column pt-2 pb-5">
    <div class="content statistics my-3">
      <h3>Admin Panel</h3>
      <div class="main-card">
        <div class="d-flex justify-content-around align-items-center gap-3">
          <button
            class="box d-flex justify-evenly align-items-center flex-column {clickedBox === 'users' ? 'selected' : ''}"
            on:click={() => handleClick("users")}
          >
            <i class="fa-solid fa-users icon"></i>
            <p class="total-info">Total users</p>
            <p class="total-num">{totalUsers || " "}</p>
          </button>
          <button
            class="box d-flex justify-evenly align-items-center flex-column {clickedBox === 'images' ? 'selected' : ''}"
            on:click={() => handleClick("images")}
          >
            <i class="fa-regular fa-images icon"></i>
            <p class="total-info">Total images</p>
            <p class="total-num">{totalImages || " "}</p>
          </button>
          <div class="pl-1">
            <div class="small-box">
              <p class="total-info">Enter User ID:</p>
              <div class="d-flex gap-2">
                <input type="text" bind:value={userIdGiven} class="edit-input" />
                <!-- <button class="edit-button">Edit</button> -->
                <button class="btn red text-white" on:click={() => handleUserDeletion(true)}>Delete</button>
                <button class="btn green text-white" on:click={() => handleUserDeletion(false)}>Restore</button>
              </div>
            </div>
            <div class="small-box">
              <p class="total-info">Enter Image ID:</p>
              <div class="d-flex gap-2">
                <input type="text" bind:value={imageIdGiven} class="edit-input form-control" />
                <!-- <button class="edit-button" on:click={handleImageEdit}>Edit</button> -->
                <div>
                  <button class="btn images-option-button red text-white" on:click={() => handleImageFlagging(true)}>Flag</button>
                  <button class="btn images-option-button green text-white" on:click={() => handleImageFlagging(false)}
                    >Unflag</button
                  >
                </div>
                <div>
                  <button class="btn images-option-button red text-white" on:click={() => handleImageDeletion(true)}
                    >Delete</button
                  >
                  <button class="btn images-option-button green text-white" on:click={() => handleImageDeletion(false)}
                    >Restore</button
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-between align-items-center my-3">
      <div></div>
      <h4>{clickedBox == "images" ? "Images" : "Users"}</h4>
    </div>

    <div class="search-options">
      <div class="d-flex justify-content-between align-items-center mb-3 gap-3">
        <div class="sort-option">
          <span>Sort by:</span>
          <select bind:value={sortByQuery} on:change={handleSearchChange} class="form-select w-100">
            {#each columns as column}
              <option value={column}>{column}</option>
            {/each}
          </select>
        </div>
        <div class="d-flex flex-column align-items-center justify-content-center gap-2">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search matching..."
            class="form-control w-100"
            on:input={handleSearchChange}
          />
          <select bind:value={searchColumn} on:change={handleSearchChange} class="form-select w-50 margin-auto">
            {#each columns as column}
              <option value={column}>{column}</option>
            {/each}
          </select>
        </div>

        <div class="d-flex align-items-center justify-content-center">
          <div class="sort-option">
            <span>Sort Order:</span>
            <select bind:value={sortOrderQuery} on:change={handleSearchChange} class="form-select w-100">
              <option>ASC</option>
              <option>DESC</option>
            </select>
          </div>
        </div>
      </div>
      <div class="d-flex align-items-cen ter justify-content-around my-4 gap-5">
        <div class="d-flex align-items-center justify-content-between flex-column">
          <label for="custom" class="custom-label"
            >Search page number(MAX={Math.ceil((clickedBox === "images" ? totalImagesFound : totalUsersFound) / resultsPerPage)}):
          </label>
          <div class="mt-1">
            <input type="number" class="custom-input" name="custom" bind:value={customPage} min="1" />
            <button on:click={toCustomPage} class="custom-button">Go</button>
          </div>
        </div>

        <div>
          <button
            on:click={toStartPage}
            disabled={clickedBox === "images" ? currentPageForImages === 1 : currentPageForUsers === 1}
            class="btn custom-button"><i class="fa-solid fa-fast-backward"></i></button
          >
          <button
            on:click={prevPage}
            disabled={clickedBox === "images" ? currentPageForImages === 1 : currentPageForUsers === 1}
            class="btn custom-button"><i class="fa-solid fa-backward-step"></i></button
          >
          <span>Page {clickedBox === "images" ? currentPageForImages : currentPageForUsers}</span>
          <button
            on:click={nextPage}
            disabled={clickedBox === "images"
              ? totalImagesFound <= currentPageForImages * resultsPerPage
              : totalUsersFound <= currentPageForUsers * resultsPerPage}
            class="btn custom-button"
            ><i class="fa-solid fa-forward-step"></i>
          </button>
          <button
            on:click={toEndPage}
            disabled={clickedBox === "images"
              ? totalImagesFound <= currentPageForImages * resultsPerPage
              : totalUsersFound <= currentPageForUsers * resultsPerPage}
            class="btn custom-button"><i class="fa-solid fa-fast-forward"></i></button
          >
        </div>
        <div class="d-flex align-items-center justify-content-between flex-column">
          <label for="custom" class="custom-label">Results per page(CURRENT={resultsPerPage}):</label>
          <div class="mt-1">
            <input type="number" class="custom-input" name="custom" bind:value={customResultsPerPage} min="1" />
            <button on:click={changeResultsPerPage} class="custom-button">Set</button>
          </div>
        </div>
      </div>
    </div>

    <div class="content">
      {#if searchQuery}
        {#if clickedBox === "users" && users.length > 0}
          <table>
            <thead>
              <tr>
                {#each Object.keys(users[0]) as key}
                  <th>{key}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#if users.length > 0}
                {#each users as item, i}
                  <tr class={i % 2 === 0 ? "even-row" : "odd-row"}>
                    {#each Object.values(item) as value}
                      <td>{value}</td>
                    {/each}
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        {:else if clickedBox === "images" && images.length > 0}
          <table>
            <thead>
              <tr>
                {#each Object.keys(images[0]) as key}
                  <th>{key}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#if images.length > 0}
                {#each images as item, i}
                  <tr class={i % 2 === 0 ? "even-row" : "odd-row"}>
                    {#each Object.values(item) as value}
                      <td>{value}</td>
                    {/each}
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        {:else}
          <div class="d-flex justify-content-center align-items-center py-4">Nothing found!</div>
        {/if}
      {:else if clickedBox === "images"}
        <div>
          <table>
            <thead>
              <tr>
                {#if images.length > 0}
                  {#each Object.keys(images[0]) as key}
                    <th>{key}</th>
                  {/each}
                {/if}
              </tr>
            </thead>
            <tbody>
              {#if images.length > 0}
                {#each images as image, i (image.id)}
                  <tr class={i % 2 === 0 ? "even-row" : "odd-row"}>
                    {#each Object.values(image) as key}
                      <td>{key}</td>
                    {/each}
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      {:else}
        <div>
          <table>
            <thead>
              <tr>
                {#if users.length > 0}
                  {#each Object.keys(users[0]) as key}
                    <th>{key}</th>
                  {/each}
                {/if}
              </tr>
            </thead>
            <tbody>
              {#if users}
                {#each users as user, i (user.id)}
                  <tr class={i % 2 === 0 ? "even-row" : "odd-row"}>
                    {#each Object.values(user) as key}
                      <td>{key}</td>
                    {/each}
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>
</div>

{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {onAlertConfirm} {...alertModalOptions}></AlertModal>
{/if}

<style>
  @import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700");

  .sort-option {
    width: 150px;
  }

  .search-options {
    font-size: 0.7rem;
  }

  .custom-button {
    margin: 0 5px;
    padding: 5px 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
  }

  .custom-input {
    width: 4rem;
    margin: 0 5px;
    padding: 5px 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
  }

  .images-option-button {
    width: 90%;
    font-size: 0.6rem;
    font-size: 0.9rem;
    padding: 0.3rem;
    margin: 0.1rem;
  }

  .red {
    background-color: red;
  }

  .green {
    background-color: green;
  }

  td {
    padding: 1rem 0.4rem;
  }
  th {
    padding: 1rem 0rem;
    text-align: center;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.75rem;
    border: 1px solid #ddd;
  }

  thead {
    background-color: black;
    color: white;
    font-family: "Source Sans Pro", sans-serif;
    text-transform: capitalize;
  }

  .even-row {
    background-color: #f6f6f6;
  }

  .odd-row {
    background-color: #ffffff;
  }

  .edit-input {
    width: 90%;
    padding: 0.5em;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .total-num {
    font-size: 1.2rem;
    margin: 0px 0px 1rem 0px;
    color: #54697b;
  }
  .total-info {
    font-size: 1.2rem;
    color: #54697b;
  }

  .icon {
    font-size: 2.7rem;
    margin-top: 1rem;
    color: #54697b;
  }

  .selected {
    box-shadow: 10px 10px 10px grey;
  }

  .content {
    flex: 1;
    margin-left: 11vw;
    width: 86vw;
  }

  .main-card {
    background-color: #ebebeb;
    border-radius: 0.8rem;
    box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
    padding: 1rem 0.5rem 1.3rem 0.5rem;
  }

  .box {
    height: 10rem;
    width: 20rem;
    color: white;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    border: none;
  }

  .custom-button:hover {
    background-color: #eaeaea;
  }
</style>
