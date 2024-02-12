<script>
  import AlertModal from "$lib/components/AlertModal.svelte"
  import { onMount } from "svelte"
  import { userDetails } from "../../stores/userDetails.js"
  import { goto } from "$app/navigation"

  let showAlertModal = false
  let alertModalOptions = {}

  const checkSignedIn = async () => {
    if ($userDetails.userName) {
      return
    }
    try {
      const response = await fetch(`http://localhost:4000/me`, {
        method: "GET",
        credentials: "include",
      })

      const reply = await response.json()
      if (!response.ok) {
        {
          userDetails.set({})
          alertModalOptions.header = "Cannot access page"
          alertModalOptions.message = "Please login to access."
          alertModalOptions.type = "failure"
          showAlertModal = true
          return
        }
      }
      userDetails.set(reply.data)
    } catch (err) {
      alertModalOptions.header = "Cannot access page"
      alertModalOptions.message = "Server may be down!"
      alertModalOptions.type = "failure"
      showAlertModal = true
      return
    }
  }

  const onAlertConfirm = () => {
    goto("/")
    showAlertModal = false
  }

  onMount(async () => {
    await checkSignedIn()
  })
</script>

{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {...alertModalOptions} {onAlertConfirm}></AlertModal>
{/if}

<slot />
