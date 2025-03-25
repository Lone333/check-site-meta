"use client"

import { useState } from "react"

export function useExpandableList(arr: unknown[]) {
  const [expandedList, setExpandedList] = useState([...Array.from(arr, () => true)])
  const isExpanded = (index: number) => expandedList[index]
  const toggaleExpanse = (index: number) => {
    setExpandedList((prev) => {
      const copy = [...prev]
      copy[index] = !copy[index]
      return copy
    })
  }
  const expandAll = () => {
    setExpandedList([...Array.from(arr, () => true)])
  }
  const collapseAll = () => {
    setExpandedList([...Array.from(arr, () => false)])
  }

  return {
    isExpanded,
    toggaleExpanse,
    expandAll,
    collapseAll,
  }

}