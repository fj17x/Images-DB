<script>
  import AlertModal from "$lib/components/AlertModal.svelte"
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  import { userDetails } from "../../stores/userDetails.js"

  let showAlertModal = false
  let alertModalOptions = {}

  const checkSignedIn = async () => {
    const response = await fetch(`http://localhost:4000/me`, {
      method: "GET",
      credentials: "include",
    })
    if (!response.ok) {
      {
        alertModalOptions.header = "Cannot access page"
        alertModalOptions.message = `Please sign in.`
        alertModalOptions.type = "failure"
        showAlertModal = true
        return
      }
    }
    const reply = await response.json()
    userDetails.set(reply.data)
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
