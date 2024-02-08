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

  let currentPageForUsers = 1
  let currentPageForImages = 1
  let customPage
  let resultsPerPage = 10
  let customResultsPerPage

  let clickedBox = "users"
  let first = true

  let imageIdGiven
  let userIdGiven

  const handleScroll = async (entity) => {
    console.log("🚀 ~ handleScroll ~ entity:", entity)
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 70) {
      await fetchUsersOrImages()
    }
  }

  const fetchUsersOrImages = async (select) => {
    let offset
    if (first || select === "users" || clickedBox === "users") {
      offset = (currentPageForUsers - 1) * resultsPerPage
      const response = await fetch(
        `http://localhost:4000/users?offset=${offset}&limit=${resultsPerPage}&sortBy=id&sortOrder=asc&showDeleted=true`,
        {
          method: "GET",
          credentials: "include",
        }
      )

      const usersReply = await response.json()
      totalUsers = usersReply.totalUsers

      if (!usersReply.data || usersReply.data.length === 0) {
        return
      }

      users = usersReply.data
    }
    if (first || select === "images" || clickedBox === "images") {
      offset = (currentPageForImages - 1) * resultsPerPage
      const response = await fetch(
        `http://localhost:4000/images?offset=${offset}&limit=${resultsPerPage}&sortBy=id&sortOrder=asc&showDeleted=true&showFlagged=true`,
        {
          method: "GET",
          credentials: "include",
        }
      )
      const imagesReply = await response.json()
      totalImages = imagesReply.totalImages

      if (!imagesReply.data || imagesReply.data.length === 0) {
        return
      }
      images = imagesReply.data
    }

    first = false
    select = "none"
  }

  const handleClick = (box) => {
    clickedBox = box
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
      currentPageForUsers = Math.ceil(totalUsers / resultsPerPage)
      await fetchUsersOrImages()
    } else if (clickedBox === "images") {
      currentPageForImages = Math.ceil(totalImages / resultsPerPage)
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
      totalPages = Math.ceil(totalUsers / resultsPerPage)
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
      totalPages = Math.ceil(totalImages / resultsPerPage)
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

  onMount(async () => {
    await fetchUsersOrImages()

    await checkWhetherAdmin()
  })
</script>

<svelte:window on:scroll={handleScroll} />

<div class="container">
  <Sidebar />
  <div class="contents">
    <div class="content">
      <h3>Admin Panel</h3>
      <div class="main-card">
        <div class="statistics">
          <button class="box blue {clickedBox === 'users' ? 'selected' : ''}" on:click={() => handleClick("users")}>
            <i class="fa-solid fa-users icon"></i>
            <p class="total-info">Total users</p>
            <p class="total-num">{totalUsers || " "}</p>
          </button>
          <button class="box green {clickedBox === 'images' ? 'selected' : ''}" on:click={() => handleClick("images")}>
            <i class="fa-regular fa-images icon"></i>
            <p class="total-info">Total images</p>
            <p class="total-num">{totalImages || " "}</p>
          </button>
          <div class="main-inputs">
            <div class="small-box">
              <p class="total-info">Enter User ID:</p>
              <div class="edit-div">
                <input type="text" bind:value={userIdGiven} class="edit-input" />
                <!-- <button class="edit-button">Edit</button> -->
                <button class="edit-button delete-button" on:click={() => handleUserDeletion(true)}>Delete</button>
                <button class="edit-button restore-button" on:click={() => handleUserDeletion(false)}>Restore</button>
              </div>
            </div>
            <div class="small-box">
              <p class="total-info">Enter Image ID:</p>
              <div class="edit-div">
                <input type="text" bind:value={imageIdGiven} class="edit-input" />
                <!-- <button class="edit-button" on:click={handleImageEdit}>Edit</button> -->
                <button class="edit-button flag-button" on:click={() => handleImageFlagging(true)}>Flag</button>
                <button class="edit-button unflag-button" on:click={() => handleImageFlagging(false)}>Unflag</button>
                <button class="edit-button delete-button" on:click={() => handleImageDeletion(true)}>Delete</button>
                <button class="edit-button restore-button" on:click={() => handleImageDeletion(false)}>Restore</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <br />
    <br />
    <br />
    <div class="pagination">
      <div class="custom-div">
        <label for="custom" class="custom-label"
          >Search page number(MAX:{Math.ceil((clickedBox === "images" ? totalImages : totalUsers) / resultsPerPage)}):
        </label>
        <input type="number" class="custom-input" name="custom" bind:value={customPage} min="1" />
        <button on:click={toCustomPage} class="custom-button">Go</button>
      </div>

      <div>
        <button
          on:click={toStartPage}
          disabled={clickedBox === "images" ? currentPageForImages === 1 : currentPageForUsers === 1}
          class="custom-button"><i class="fa-solid fa-fast-backward"></i></button
        >
        <button
          on:click={prevPage}
          disabled={clickedBox === "images" ? currentPageForImages === 1 : currentPageForUsers === 1}
          class="custom-button"><i class="fa-solid fa-backward-step"></i></button
        >
        <span>Page {clickedBox === "images" ? currentPageForImages : currentPageForUsers}</span>
        <button
          on:click={nextPage}
          disabled={totalUsers <= (clickedBox === "images" ? currentPageForImages : currentPageForUsers) * resultsPerPage &&
            totalImages <= (clickedBox === "images" ? currentPageForImages : currentPageForUsers) * resultsPerPage}
          class="custom-button"
          ><i class="fa-solid fa-forward-step"></i>
        </button>
        <button
          on:click={toEndPage}
          disabled={totalUsers <= (clickedBox === "images" ? currentPageForImages : currentPageForUsers) * resultsPerPage &&
            totalImages <= (clickedBox === "images" ? currentPageForImages : currentPageForUsers) * resultsPerPage}
          class="custom-button"><i class="fa-solid fa-fast-forward"></i></button
        >
      </div>
      <div class="custom-div">
        <label for="custom" class="custom-label">Results per page(CURRENT: {resultsPerPage}):</label>
        <input type="number" class="custom-input" name="custom" bind:value={customResultsPerPage} min="1" />
        <button on:click={changeResultsPerPage} class="custom-button">Go</button>
      </div>
    </div>
    <h4>{clickedBox == "images" ? "Images" : "Users"}</h4>
    <div class="content">
      {#if clickedBox === "images"}
        <div class="images-table">
          <table>
            <thead>
              <tr>
                <th>Image ID</th>
                <th>Title</th>
                <th>URL</th>
                <th>Description</th>
                <th>Owner ID</th>
                <th>Tags</th>
                <th>isFlagged</th>
                <th>createdAt</th>
                <th>updatedAt</th>
                <th>destroyTime</th>
              </tr>
            </thead>
            <tbody>
              {#if images}
                {#each images as image, i (image.id)}
                  <tr class={i % 2 === 0 ? "even-row" : "odd-row"}>
                    <td>{image.id}</td>
                    <td>{image.title}</td>
                    <td>{image.url}</td>
                    <td>{image.description}</td>
                    <td>{image.ownerId}</td>
                    <td>
                      {#each image.tags as tag}
                        {tag};
                      {/each}
                    </td>
                    <td>{image.isFlagged}</td>
                    <td>{image.createdAt}</td>
                    <td>{image.updatedAt}</td>
                    <td>{image.destroyTime}</td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>{:else}
        <div class="user-table">
          <table class="table-head">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>isAdmin</th>
                <th>createdAt</th>
                <th>updatedAt</th>
                <th>Password</th>
                <th>destroyTime</th>
              </tr>
            </thead>
            <tbody>
              {#if users}
                {#each users as user, i (user.id)}
                  <tr class={i % 2 === 0 ? "even-row" : "odd-row"}>
                    <td>{user.id}</td>
                    <td>{user.userName}</td>
                    <td>{user.isAdmin}</td>
                    <td>{user.createdAt}</td>
                    <td>{user.updatedAt}</td>
                    <td>{user.password}</td>
                    <td>{user.destroyTime}</td>
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

  .custom-label {
    color: grey;
    font-size: 0.9rem;
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0rem 0 2rem 0;
    gap: 6rem;
  }

  .custom-button,
  .custom-input {
    margin: 0 5px;
    padding: 5px 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
    cursor: pointer;
  }

  .custom-button:hover {
    background-color: #eaeaea;
  }

  .custom-input {
    width: 4rem;
    text-align: center;
  }

  .pagination .custom-div {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
  }

  .flag-button {
    background-color: red;
  }
  .unflag-button {
    background-color: green;
  }

  .delete-button {
    background-color: red;
  }

  .restore-button {
    background-color: green;
  }

  td {
    padding: 1rem 0.4rem;
  }
  th {
    padding: 1rem 0rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.75rem;
    border: 1px solid #ddd;
  }

  .images-table {
    width: 100%;
  }

  thead {
    background-color: black;
    color: white;
    font-family: "Source Sans Pro", sans-serif;
    text-transform: capitalize;
  }

  .main-inputs {
    padding-left: 0.7rem;
  }

  @media screen and (max-width: 1150px) {
    .statistics {
      flex-direction: column;
    }

    .box {
      width: 100%;
    }

    .small-box {
      display: block;
      width: 100%;
    }
  }

  .even-row {
    background-color: #f6f6f6;
  }

  .odd-row {
    background-color: #ffffff;
  }

  .edit-div {
    display: flex;
    gap: 10px;
  }

  .edit-button {
    font-size: 0.6rem;
    border-radius: 0.3rem;
    color: #fff;
    cursor: pointer;
    border: none;
    padding: 0.5rem 1rem;
  }

  .edit-input {
    width: 90%;
    padding: 0.5em;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .edit-button:hover {
    transform: scale(1.05);
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

  .statistics {
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 10px;
  }

  .box {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    flex-direction: column;
    height: 10rem;
    width: 20rem;
    color: white;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    border: none;
  }

  .selected {
    box-shadow: 10px 10px 10px grey;
  }

  .blue {
    background-color: white;
  }

  .green {
    background-color: white;
  }

  .container {
    display: flex;
  }

  .content {
    flex: 1;
    padding: 0px 0.5rem;
    margin-left: 11vw;
    width: 86vw;
  }

  .contents {
    display: flex;
    align-items: center;
    flex-direction: column;
    margin: 0px 0px 2rem 0;
  }

  .main-card {
    background-color: #ebebeb;
    border-radius: 0.8rem;
    box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
    padding: 2rem 0.5rem 3rem 0.5rem;
  }
</style>
